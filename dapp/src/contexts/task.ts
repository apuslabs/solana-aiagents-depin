import axios from "axios";
import useSWR from "swr";
import qs from 'qs';
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export interface CreateTaskData {
    model_name: string
    prompt: string
    negative_prompt: string
    width: number
    height: number
}

const novitaFetcher = axios.create({
    baseURL: 'https://api.novita.ai',
    headers: {
        'Authorization': 'Bearer b1562478-2a16-4c47-ba13-2934da2834e3'
    }
})

const solApiFetcher = axios.create({
    baseURL: 'https://solapi.apus.network',
    // baseURL: 'http://localhost:80',
})

const getFetcher = (url: string) => novitaFetcher.get(url).then((res) => res.data);

const novitaAgentId = "481a0cd0-08fe-4748-9f1b-c29bff69700d"


export function useModels() {
    // ?filter.visibility=public&pagination.limit=10&pagination.cursor=c_0&filter.types=checkpoint&filter.source=civitai'
  const { data, error, isLoading } = useSWR(`/v3/model?${qs.stringify({
    filter: {
        visibility: 'public',
        types: 'checkpoint',
        source: 'civitai'
    },
    pagination: {
        limit: 20,
        cursor: 'c_1',
    },
  }, { allowDots: true })}`, getFetcher, {
    revalidateOnFocus: false,
  })
  return [data?.models ?? [], error, isLoading]
}

export function useTask() {
    const { publicKey } = useWallet()
    const [solTaskId, setSolTaskId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(false)
    const [taskId, setTaskId] = useState<string | null>(null)
    const {data: imageRes, error: getImageError } = useSWR(taskId && `/v3/async/task-result?task_id=${taskId}`, getFetcher, {
        refreshInterval: (latestData) => {
            if (latestData) {
                if (latestData?.task?.status === 'TASK_STATUS_QUEUED' || latestData?.task?.status === 'TASK_STATUS_PROCESSING') {
                    return 1000
                } else {
                    setIsImageLoading(false)
                    return 0
                }
            }
            return 0
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onSuccess: (data) => {
            if (data?.task?.status === "TASK_STATUS_SUCCEED") {
                setIsImageLoading(false)
                setLoading(false)
                solApiFetcher.post(`/complete-task`, {
                    taskId: solTaskId,
                    proofOfWork: ""
                }).catch(console.error)
            }
        },
        onError: () => {
            setIsImageLoading(false)
            setLoading(false)
        }
    })
    return {
        createTask: async (data: CreateTaskData) => {
            if (loading) {
                return
            }
            setSolTaskId(null)
            setLoading(true)
            try {
                const rfcRes = await solApiFetcher.get(`/request-for-connection?${qs.stringify({
                    agent_id: novitaAgentId,
                    payer: publicKey?.toBase58(),
                })}`)
                if (!rfcRes.data.taskId) {
                    throw new Error('task id not created')
                }
                setSolTaskId(rfcRes.data.taskId)
                const t2iRes = await solApiFetcher.post('/forward', {
                    method: 'POST',
                    url: `${rfcRes.data.baseUrl}/v3/async/txt2img`,
                    data: {
                        "extra": {
                          "response_image_type": "jpeg",
                          "enable_nsfw_detection": true,
                          "nsfw_detection_level": 2,
                        },
                        "request": {
                          "model_name": data.model_name,
                          "prompt": data.prompt,
                          "negative_prompt": data.negative_prompt,
                          "sd_vae": "",
                          "loras": [],
                          "embeddings": [],
                          "width": data.width,
                          "height": data.height,
                          "image_num": 1,
                          "steps": 20,
                          "seed": Math.floor(Math.random() * 100000),
                          "clip_skip": 1,
                          "guidance_scale": 7.5,
                          "sampler_name": "DPM++ 2S a"
                        }
                      }
                })
                if (t2iRes.data.task_id) {
                setTaskId(t2iRes.data.task_id)
                setIsImageLoading(true)
                }
            } catch (e) {
                setError(JSON.stringify(e))
                setLoading(false)
            }
        },
        error: error || getImageError,
        loading: loading,
        imageRes,
        isImageLoading
    }
}
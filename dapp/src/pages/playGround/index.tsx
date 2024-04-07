import { FC, useState, ChangeEvent, useEffect } from 'react'
import DropSelect from '../../components/DropSelect'
import { aspectList, aspectMap, StyleList } from '../../config/configData'
import type { Options } from '../../config/configData'
import { Icon } from '../../components/SvgIcon'
import { useModels, CreateTaskData, useTask } from '../../contexts/task'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

interface formData {
  aspect: string
  model: string
  style: string
  advanced: string
  prompt: string
}

function getCreateTaskData(formData: formData): CreateTaskData {
  return {
    model_name: formData.model,
    prompt: formData.prompt + '  ' + StyleList.find(v => v.value === formData.style)?.prompt,
    negative_prompt: formData.advanced,
    width: aspectMap[formData.aspect].width,
    height: aspectMap[formData.aspect].height
  }
}

const defaultFormData= {
  aspect: '1:1',
  model: '',
  style: 'Art Deco',
  advanced: 'blurry, blur, text, watermark, render, 3D, NSFW, nude, CGI, monochrome, B&W, cartoon, painting, smooth, plastic, blurry, low-resolution, deep-fried, oversaturated',
  prompt: ''
}

function useFormData() {
  const [formData, setFormData] = useState<formData>(localStorage.getItem('formData') ? JSON.parse(localStorage.getItem('formData') ?? '') : defaultFormData)

  useEffect(() => {
    // auto save to localstorage
    localStorage.setItem('formData', JSON.stringify(formData))
  }, [formData])

  return [formData, setFormData] as const
}

const PlayGround: FC = () => {
  const [models] = useModels()
  const [formData, setFormData] = useFormData()

  useEffect(() => {
    if (models.length > 0 && formData.model === '') {
      setFormData(formData => ({
        ...formData,
        model: models[0].sd_name_in_api
      }))
    }
  }, [models, formData])

  const handleAdChange = (e: ChangeEvent<HTMLTextAreaElement>, name = 'advanced') => {
    const value = e.target.value
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const {
    createTask,
    loading,
    imageRes,
    isImageLoading,
  } = useTask()

  return (
    <div className="flex" style={{
      height: 'calc(100vh - 40px - 80px)'
    }}>
      <div className="h-full w-80 flex flex-col">
        <div className="bg-white rounded-lg p-3 shadow-dark flex-grow overflow-y-scroll">
          <div className="text-lg">Aspect Ratio</div>
          <DropSelect data={aspectList} value={formData.aspect} onChange={(data: Options) => setFormData({ ...formData, aspect: data.value })} />
          <div className="text-lg mt-3">Model</div>
          <DropSelect data={models?.map((v: any) => {
            return {
              label: v.name,
              value: v.sd_name_in_api,
              headType: 'image',
              imageUrl: v.cover_url,
            }
          }) ?? []} value={formData.model} onChange={(data: Options) => setFormData({ ...formData, model: data.value })} />
          <div className="text-lg mt-3">Style</div>
          <DropSelect data={StyleList} value={formData.style} onChange={(data: Options) => setFormData({ ...formData, style: data.value })} />

          <div className="collapse bg-white">
            <input type="checkbox" /> 
            <div className="collapse-title text-lg pl-0 flex items-center h-[28px] hover:bg-[#e6e6e6]">
              <Icon name="Down" size={24} />
              <span>Advanced Settings</span>
            </div>
            <div className="collapse-content px-1">
              <div className="text-lg">Negative Prompt</div>
              <textarea value={formData.advanced} onChange={(e) => handleAdChange(e)} className="textarea textarea-bordered w-full bg-neutral h-28"></textarea>
            </div>
          </div>
        </div>
        <button className="btn w-full mt-3 shadow-dark bg-white hover:bg-[#0056B5] hover:text-white border-0 text-xl font-normal" onClick={() => {
          if (!publicKey) {
            setVisible(true)
            return
          }
          createTask(getCreateTaskData(formData))
        }}>
          { (loading || isImageLoading) && <span className="loading loading-spinner"></span>}
          Generate
        </button>
      </div>

      <div className='flex-1 flex flex-col ml-5'>
        <div className="bg-white rounded-lg p-3 shadow-dark">
          <div className="text-lg">Prompt</div>
          <textarea value={formData.prompt} onChange={(e) => handleAdChange(e, 'prompt')} className="textarea textarea-bordered w-full bg-neutral h-16"></textarea>
        </div>
        <div className={`mt-4 flex items-center justify-center`}>
          <div className={`bg-white rounded-lg shadow-dark flex justify-center items-center ${aspectMap[formData.aspect].tailwindcss}`} style={{
            height: 'calc(100vh - 40px - 80px - 122px - 16px)'
          }}>{isImageLoading ? <span className="loading loading-spinner w-96"></span> : 
            imageRes ? <img className="w-full h-full object-contain" src={imageRes?.images?.[0]?.image_url} /> : null}</div>
        </div>
      </div>
    </div>
  )
}

export default PlayGround
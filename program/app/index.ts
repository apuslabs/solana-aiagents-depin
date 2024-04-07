
import {default as express} from 'express'
import {default as bodyParser} from 'body-parser'
import {default as cors} from 'cors'
import { AiTask } from '../target/types/ai_task'
import idl from '../target/idl/ai_task.json'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import axios, { AxiosResponse } from 'axios'
import os from 'os'

const app = express()
app.use(bodyParser.json());
app.use(cors());

import { AnchorProvider, Wallet, Program, BN } from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

const mintAddress = "CrhmSkC19d8QeeBK5kUtreXfg1wvWvvVZhBTRjbmY18m"
const mintAccount = new web3.PublicKey(mintAddress)
const quickNodeApiUrl = "https://flashy-delicate-violet.solana-devnet.quiknode.pro/72bbc0b0fab9fc0806a21bec0da46acde5e84d4b/"

const connection = new web3.Connection(quickNodeApiUrl)
const wallet = new Wallet(web3.Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      // HOME
      require("fs").readFileSync(path.join(os.homedir(), ".config/solana/id.json"), {
        encoding: "utf-8",
      })
    )
  )
))

const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())

const program = new Program<AiTask>(idl as any, "47VwehJMrzhe4i4JeKX2crv6fKYoEMhZPG8Bv8gRJ27v", provider)


const [gpuNodeRegistryAccount] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("gpu_node_registry")],
  program.programId
)
const [agentRegistryAccount] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("agent_registry")],
  program.programId
)
const [aiTaskRegistryAccount] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("task_registry")],
  program.programId
)
const [delegate] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("delegate")],
  program.programId
)



interface GpuNode {
  key: web3.PublicKey
  id: string
  owner: web3.PublicKey
  cpuCores: number
  memory: number
  storage: number
  gpuCardModel: string
  price: BN
  endpoint: string
}

interface Agent {
  key: web3.PublicKey
  id: string
  owner: web3.PublicKey
  title: string
  desc: string
  poster: string
  category: string
  dockerImageLink: string
  apiDoc: string
  price: BN
}

interface Task {
  key: web3.PublicKey
  id: string
  gpuNodeId: string
  agentId: string
  payer: web3.PublicKey
  status: string
  gpuNodeFee: BN
  agentFee: BN
  proofOfWork: string
}


const GpuNodeCache = new Map<string, GpuNode>()

function getGpuNodeWithCache(account: web3.PublicKey) {
  if (GpuNodeCache.has(account.toBase58())) {
    return Promise.resolve(GpuNodeCache.get(account.toBase58()))
  }
  return program.account.gpuNode.fetch(account).then(node => {
    const formatedNode = {
      ...node,
      key: account,
      price: new BN(node.price).toNumber() as any,
    }
    GpuNodeCache.set(account.toBase58(), formatedNode)
    return formatedNode
  })
}

const AgentCache = new Map<string, Agent>()

function getAgentWithCache(account: web3.PublicKey) {
  if (AgentCache.has(account.toBase58())) {
    return Promise.resolve(AgentCache.get(account.toBase58()))
  }
  return program.account.agent.fetch(account).then(agent => {
    const formatedAgent = {
      ...agent,
      key: account,
      price: new BN(agent.price).toNumber() as any,
    }
    AgentCache.set(account.toBase58(), formatedAgent)
    return formatedAgent
  })
}

const TaskCache = new Map<string, Task>()

function getTaskWithCache(account: web3.PublicKey, force = false) {
  if (TaskCache.has(account.toBase58()) && !force) {
    return Promise.resolve(TaskCache.get(account.toBase58()))
  }
  return program.account.aiTask.fetch(account, 'processed').then(task => {
    const formatedTask = {
      ...task,
      key: account,
      gpuNodeFee: new BN(task.gpuNodeFee).toNumber() as any,
      agentFee: new BN(task.agentFee).toNumber() as any,
    }
    TaskCache.set(account.toBase58(), formatedTask)
    return formatedTask
  })
}

app.post('/register-gpu-node', (req, res) => {
  let gpuNodeOwner = new web3.PublicKey(req.body.gpuNodeOwner)
  let id = req.body.id
  let sk = req.body.sk
  let cpuCores = req.body.cpuCores
  let memory = req.body.memory
  let storage = req.body.storage
  let gpuCardModel = req.body.gpuCardModel
  let price = req.body.price
  let endpoint = req.body.endpoint

  // TODO: validate the input

  const gpuNode = {
    id: id,
    owner: gpuNodeOwner,
    cpuCores: cpuCores,
    memory: memory,
    storage: storage,
    gpuCardModel: gpuCardModel,
    price: new BN(price),
    endpoint: endpoint,
  }

  const gpuNodeAccount = web3.Keypair.fromSeed(base64.decode(sk));

  program.methods.registerGpuNode(gpuNode).accounts({
    gpuNodeRegistry: gpuNodeRegistryAccount,
    node: gpuNodeAccount.publicKey,
  }).signers([gpuNodeAccount]).rpc().then(tx => {
    console.log("Registered tx", tx);
    res.send({
      id: gpuNodeAccount.publicKey.toBase58(),
      sk: gpuNodeAccount.secretKey.toString(),
    });
  }).catch(e => {
    console.error(e);
    res.status(500).send({
      msg: JSON.stringify(e),
    });
  });

})
function healthCheck(endpoint: string, id: string, agentId: string) {
  return axios.get(`${endpoint}/healthCheck?agent=${agentId}`).then((axiosRes: AxiosResponse<{
    code: number
    msg: string
    data?: {
      port: number
      busy: boolean
    }
  }>) => {
    if (!axiosRes.data) {
      return Promise.reject("Unknown Error")
    }
    const res = axiosRes.data
    if (res?.code === 200 && !res?.data?.busy && res?.data?.port) {
      return {
        baseUrl: endpoint + ":" + res.data.port,
        agentId: agentId,
        gpuNodeId: id,
      }
    }
    if (res?.code !== 200) {
      return Promise.reject(res.msg)
    }
    if (res?.data?.busy) {
      return Promise.reject("Node Busy")
    }
    if (!res?.data?.port) {
      return Promise.reject("Agent not available")
    }
    return Promise.reject("Unknown Error")
  }).catch(e => {
    return Promise.reject(e?.code ?? e)
  })
}

function onlineCheck(endpoint: string) {
  return axios.get(`${endpoint}/healthCheck`, {
    timeout: 2000,
  }).then((axiosRes: AxiosResponse<{
    code: number
    msg: string
  }>) => {
    if (!axiosRes.data) {
      return Promise.reject("Unknown Error")
    }
    const res = axiosRes.data
    if (res?.code === 200) {
      return {
        status: "Online",
      }
    }
    return Promise.reject("Offline")
  }).catch(e => {
    return Promise.reject("Offline")
  })

}

app.get('/request-for-connection', async (req: {
  query: {
    agent_id: string
    payer: string
  }
}, res) => {
  let agentId = req.query.agent_id
  let payer = req.query.payer // user wallet address
  // TODO: validate the input

  try {
    const gpuNodeRegistry = await program.account.gpuNodeList.fetch(gpuNodeRegistryAccount)
    const gpuNodeList = await Promise.all(gpuNodeRegistry.nodes.map(node => {
      return getGpuNodeWithCache(node.key)
    }))
    const agentRegistry = await program.account.agentList.fetch(agentRegistryAccount)
    const healthCheckPromises = gpuNodeList.map(node => {
      console.log(`${node.endpoint}/healthCheck?agent=${agentId}`)
      return healthCheck(node.endpoint, node.id, agentId)
    })
    // find resolved promise
    const fastestGpuNode = await Promise.any(healthCheckPromises)

    // const fastestGpuNode = {
    //   baseUrl: `http://${gpuNodeList[0].endpoint}:50020`,
    //   agentId: agentId,
    //   gpuNodeId: gpuNodeList[0].id,
    // }
    
    const agentKey = agentRegistry.agents.find(agent => agent.id === agentId)?.key
    const gpuNodeKey = gpuNodeRegistry.nodes.find(node => node.id === fastestGpuNode.gpuNodeId)?.key

    const taskAccount = web3.Keypair.generate();

    const payerPubKey = new web3.PublicKey(payer);
    const payerATA = getAssociatedTokenAddressSync(
      mintAccount,
      payerPubKey
    )

    const id = uuidv4()

    await program.methods.submitTask(id).accounts({
      gpuNode: gpuNodeKey,
      agent: agentKey,
      aiTaskRegistry: aiTaskRegistryAccount,
      task: taskAccount.publicKey,
      payer: payerATA,
      delegate: delegate,
      signer: wallet.publicKey,
    }).signers([taskAccount]).rpc()

    res.send({
      baseUrl: fastestGpuNode.baseUrl,
      taskId: id,
    })

  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.post('/complete-task', async(req, res) => {
  try {
    let taskId = req.body.taskId
    let result = req.body.proofOfWork

    // TODO: validate the input

    const taskRegistry = await program.account.aiTaskList.fetch(aiTaskRegistryAccount, 'processed')
    const taskAccount = taskRegistry.tasks.find(task => task.id === taskId)?.key
    if (!taskAccount) {
      throw new Error("Task not found")
    }
    const task = await getTaskWithCache(taskAccount)
    const agentAccount = await program.account.agentList.fetch(agentRegistryAccount)
    const agentKey = agentAccount.agents.find(agent => agent.id === task.agentId)?.key
    if (!agentKey) {
      throw new Error("Agent not found")
    }
    const agent = await getAgentWithCache(agentKey)
    const gpuNodeAccount = await program.account.gpuNodeList.fetch(gpuNodeRegistryAccount)
    const gpuNodeKey = gpuNodeAccount.nodes.find(node => node.id === task.gpuNodeId)?.key
    if (!gpuNodeKey) {
      throw new Error("GPU Node not found")
    }
    const gpuNode = await getGpuNodeWithCache(gpuNodeKey)
    const gpuNodeOwnerATA = getAssociatedTokenAddressSync(
      mintAccount,
      gpuNode.owner
    )
    const agentOwnerATA = getAssociatedTokenAddressSync(
      mintAccount,
      agent.owner
    )

    await program.methods.completeTask(result).accounts({
      aiTaskRegistry: aiTaskRegistryAccount,
      task: taskAccount,
      mint: mintAccount,
      payer: task.payer,
      gpuNodeOwnerAta: gpuNodeOwnerATA,
      agentOwnerAta: agentOwnerATA,
      gpuNodeOwner: gpuNode.owner,
      agentOwner: agent.owner,
      delegate: delegate,
      signer: wallet.publicKey,
    }).rpc();

    res.status(200).send({
      msg: "Task completed"
    })

  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.post('/register-agent', (req, res) => {
  let id = req.body.id
  let agentOwner = req.body.agentOwner
  let title = req.body.title
  let desc = req.body.desc
  let poster = req.body.poster
  let category = req.body.category
  let dockerImageLink = req.body.dockerImageLink
  let apiDoc = req.body.apiDoc
  let price = req.body.price
  let dockerDefaultPort = req.body.dockerDefaultPort

  // TODO: validate the input

  const agent = {
    id: id ?? uuidv4(),
    owner: new web3.PublicKey(agentOwner),
    title: title,
    desc: desc,
    poster: poster,
    category: category,
    dockerImageLink: dockerImageLink,
    apiDoc: apiDoc,
    dockerDefaultPort: dockerDefaultPort,
    price: new BN(price),
  }

  const agentAccount = web3.Keypair.generate();

  program.methods.registerAgent(agent).accounts({
    agentRegistry: agentRegistryAccount,
    agent: agentAccount.publicKey,
  }).signers([agentAccount]).rpc().then(tx => {
    console.log("Registered tx", tx);
    res.send({
      id: agentAccount.publicKey.toBase58(),
      sk: agentAccount.secretKey.toString(),
    });
  }).catch(e => {
    console.error(e);
    res.status(500).send({
      msg: JSON.stringify(e),
    });
  });
})

app.get('/agents', async (req, res) => {
  try {
    const agentRegistry = await program.account.agentList.fetch(agentRegistryAccount)
    const agents = await Promise.all(agentRegistry.agents.map(agent => {
      return getAgentWithCache(agent.key)
    }))
    if (req.query.owner) {
      res.send(agents.filter(agent => agent.owner.toBase58() === req.query.owner))
      return
    }
    res.send(agents)
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get('/count-agents', async (req, res) => {
  try {
    const agentRegistry = await program.account.agentList.fetch(agentRegistryAccount)
    res.send({
      count: agentRegistry.agents.length,
    })
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get('/gpu-nodes', async (req, res) => {
  try {
    const gpuNodeRegistry = await program.account.gpuNodeList.fetch(gpuNodeRegistryAccount)
    const nodes = await Promise.all(gpuNodeRegistry.nodes.map(node => {
      return getGpuNodeWithCache(node.key).then(node => {
        // healthCheck
        return onlineCheck(node.endpoint).then(() => {
          return {
            ...node,
            status: "Online",
          }
        }).catch(e => {
          console.warn(node.id, 'Offline')
          return {
            ...node,
            status: "Offline",
          }
        })
      })
    }))
    if (req.query.owner) {
      res.send(nodes.filter(node => node.owner.toBase58() === req.query.owner))
      return
    }

    res.send(nodes)
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get('/count-gpu-nodes', async (req, res) => {
  try {
    const gpuNodeRegistry = await program.account.gpuNodeList.fetch(gpuNodeRegistryAccount)
    res.send({
      count: gpuNodeRegistry.nodes.length,
    })
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get('/tasks', async (req, res) => {
  try {
    const taskRegistry = await program.account.aiTaskList.fetch(aiTaskRegistryAccount)
    if (req.query.task_id) {
      const taskAccount = taskRegistry.tasks.find(task => task.id === req.query.task_id)?.key
      if (!taskAccount) {
        throw new Error("Task not found")
      }
      const task = await getTaskWithCache(taskAccount, true)
      res.send([task])
      return
    }
    const tasks = await Promise.all(taskRegistry.tasks.map((task, index) => {
      // force fetch for the latest 3 tasks 
      return getTaskWithCache(task.key, index >= taskRegistry.tasks.length - 3)
    }))
    res.send(tasks.reverse())
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get('/count-tasks', async (req, res) => {
  try {
    const taskRegistry = await program.account.aiTaskList.fetch(aiTaskRegistryAccount)
    res.send({
      count: taskRegistry.tasks.length,
    })
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.get ('/count-payout', async (req, res) => {
  try {
    const taskRegistry = await program.account.aiTaskList.fetch(aiTaskRegistryAccount)
    const tasks = await Promise.all(taskRegistry.tasks.map(task => {
      return getTaskWithCache(task.key)
    }))
    const payout = tasks.reduce((acc, task) => {
      return acc + task.agentFee + task.gpuNodeFee
    }, 0)
    res.send({
      payout: payout,
    })
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.post('/forward', async (req, res) => {
  const { method, url, data } = req.body
  try {
    const response = await axios({
      method,
      url,
      data,
    })
    res.json(response.data)
  } catch (e) {
    console.error(e)
    res.status(500).send({
      msg: JSON.stringify(e),
    })
  }
})

app.listen(80, () => {
  console.log(`Example app listening on port ${80}`)
})
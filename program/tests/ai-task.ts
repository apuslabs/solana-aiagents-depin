import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { createAssociatedTokenAccount, mintToChecked, approveChecked, getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token'
import { AiTask } from "../target/types/ai_task";
import { assert } from "chai";
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'

function fakeGPUNode() {
  return {
    id: uuidv4(),
    owner: web3.Keypair.generate().publicKey,
    cpuCores: 8,
    memory: 32,
    storage: 512,
    gpuCardModel: "NVIDIA RTX 3090",
    price: new anchor.BN(10),
    endpoint: faker.internet.url(),
  }
}

function fakeAgent() {
  return {
    id: uuidv4(),
    owner: web3.Keypair.generate().publicKey,
    title: faker.lorem.words(),
    desc: faker.lorem.sentence(),
    poster: faker.internet.url(),
    category: "LLM",
    dockerImageLink: faker.internet.url(),
    dockerDefaultPort: 80,
    apiDoc: faker.internet.url(),
    price: new anchor.BN(10),
  }
}

describe("ai-task", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const program = anchor.workspace.AiTask as Program<AiTask>;

  const gpuNodeOwner = web3.Keypair.generate();
  const agentOwner = web3.Keypair.generate();
  const customer = web3.Keypair.generate();

  let mint = web3.Keypair.generate();

  const gpuNodeOwnerATA = getAssociatedTokenAddressSync(
    mint.publicKey,
    gpuNodeOwner.publicKey
  )
  const agentOwnerATA = getAssociatedTokenAddressSync(
    mint.publicKey,
    agentOwner.publicKey
  )
  const customerATA = getAssociatedTokenAddressSync(
    mint.publicKey,
    customer.publicKey
  )

  // Derive PDA
  const [gpuNodeRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("gpu_node_registry")],
    program.programId
  )
  const [agentRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("agent_registry")],
    program.programId
  )
  const [aiTaskRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("task_registry")],
    program.programId
  )
  const [delegate] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("delegate")],
    program.programId
  )

  before(async () => {
    // airdrop to GPU Node Owner and Agent Owner
    await connection.requestAirdrop(gpuNodeOwner.publicKey, 10000000000);
    await connection.requestAirdrop(agentOwner.publicKey, 10000000000);
    await connection.requestAirdrop(customer.publicKey, 10000000000);
  })

  
  
  it("Initialized", async () => {

    // Add your test here.
    const tx = await program.methods.initialize().accounts({
      signer: wallet.publicKey,
      mint: mint.publicKey,
      gpuNodeRegistry: gpuNodeRegistry,
      agentRegistry: agentRegistry,
      aiTaskRegistry: aiTaskRegistry,
      delegate: delegate,
    }).signers([mint]).rpc().catch(console.error);

    console.log("Initialized signature", tx);
  });

  it("Mint Token", async () => {
    // create ATA for customer
    const createATATx = await createAssociatedTokenAccount(connection, wallet.payer, mint.publicKey, customer.publicKey);
    console.log("Create ATA signature", createATATx);
    // mint token to customer
    const mintTx = await mintToChecked(connection, wallet.payer, mint.publicKey, customerATA, wallet.payer, 1000, 9);
    console.log("Mint signature", mintTx);

    const customerATAAccount = await getAccount(connection, customerATA);

    assert(customerATAAccount.amount.toString() == "1000")

    // approve to delegate
    const approveTx = await approveChecked(connection, customer, mint.publicKey, customerATA, delegate, customer, 100, 9);
    console.log("Approve signature", approveTx);

    const customerATAAccount2 = await getAccount(connection, customerATA);
    assert(customerATAAccount2.delegate.toString() == delegate.toString())
    assert(customerATAAccount2.delegatedAmount.toString() == "100")
  })
  
  it("Register GPU Node", async () => {
    const gpuNode = fakeGPUNode()

    const gpuNodeAccount = web3.Keypair.generate();

    // Add your test here.
    const tx = await program.methods.registerGpuNode(gpuNode).accounts({
      gpuNodeRegistry: gpuNodeRegistry,
      node: gpuNodeAccount.publicKey,
    }).signers([gpuNodeAccount]).rpc();

    console.log("Register GPU Node signature", tx);

    const gpuNodeRegistryAccount = await program.account.gpuNodeList.fetch(gpuNodeRegistry);
    assert(gpuNodeRegistryAccount.nodes[0].id == gpuNode.id);
  })

  it("Register Agent", async () => {
    const agent = fakeAgent()
    const agentAccount = web3.Keypair.generate();

    // Add your test here.
    const tx = await program.methods.registerAgent(agent).accounts({
      agentRegistry: agentRegistry,
      agent: agentAccount.publicKey,
    }).signers([agentAccount]).rpc();

    console.log("Register Agent signature", tx);

    const agentRegistryAccount = await program.account.agentList.fetch(agentRegistry);
    assert(agentRegistryAccount.agents[0].id == agent.id);
  })

  it("Register More Agent and GPUNode", async () => {
    const gpuNode = fakeGPUNode()
    const gpuNodeAccount = web3.Keypair.generate();
    const agent = fakeAgent()
    const agentAccount = web3.Keypair.generate();

    const tx1 = await program.methods.registerGpuNode(gpuNode).accounts({
      gpuNodeRegistry: gpuNodeRegistry,
      node: gpuNodeAccount.publicKey,
    }).signers([gpuNodeAccount]).rpc();

    console.log("Register GPU Node signature", tx1);

    const tx2 = await program.methods.registerAgent(agent).accounts({
      agentRegistry: agentRegistry,
      agent: agentAccount.publicKey,
    }).signers([agentAccount]).rpc();

    console.log("Register Agent signature", tx2);

    const gpuNodeRegistryAccount = await program.account.gpuNodeList.fetch(gpuNodeRegistry);
    assert(gpuNodeRegistryAccount.nodes.length == 2);

    const agentRegistryAccount = await program.account.agentList.fetch(agentRegistry);
    assert(agentRegistryAccount.agents.length == 2);
  })

  it("Submit Task", async () => {
    const id = uuidv4()
    const gpuNodeRegistryAccount = await program.account.gpuNodeList.fetch(gpuNodeRegistry);
    const agentRegistryAccount = await program.account.agentList.fetch(agentRegistry);
    const gpuNode = gpuNodeRegistryAccount.nodes[0].key;
    const agent = agentRegistryAccount.agents[0].key;
    const taskAccount = web3.Keypair.generate();
    console.log("GPU Node", gpuNode.toBase58())
    console.log("Agent", agent.toBase58())

    const tx = await program.methods.submitTask(id).accounts({
      gpuNode: gpuNode,
      agent: agent,
      aiTaskRegistry: aiTaskRegistry,
      task: taskAccount.publicKey,
      payer: customerATA,
      delegate: delegate,
      signer: wallet.publicKey,
    }).signers([taskAccount]).rpc().catch(console.error);

    console.log("Submit Task signature", tx);
  })

  it ("Complete Task", async () => {
    const taskRegistryAccount = await program.account.aiTaskList.fetch(aiTaskRegistry);
    const task = taskRegistryAccount.tasks[0].key;

    // get user balance
    const customerATAAccountBefore = await getAccount(connection, customerATA);
    console.info("Customer balance", customerATAAccountBefore.amount.toString())
    console.info("Customer delegated balance", customerATAAccountBefore.delegatedAmount.toString())

    const tx = await program.methods.completeTask("").accounts({
      aiTaskRegistry: aiTaskRegistry,
      task: task,
      mint: mint.publicKey,
      payer: customerATA,
      gpuNodeOwnerAta: gpuNodeOwnerATA,
      agentOwnerAta: agentOwnerATA,
      gpuNodeOwner: gpuNodeOwner.publicKey,
      agentOwner: agentOwner.publicKey,
      delegate: delegate,
      signer: wallet.publicKey,
    }).rpc().catch(console.error);

    console.log("Complete Task signature", tx);

    // assert task status
    const taskAccount = await program.account.aiTask.fetch(task);
    console.log(taskAccount)
    assert(taskAccount.status == "completed")

    // assert user balance
    const customerATAAccount = await getAccount(connection, customerATA);
    assert(customerATAAccount.amount.toString() == "980")
    // assert delegate balance
    assert(customerATAAccount.delegatedAmount.toString() == "80")
    // assert gpu node owner balance
    const gpuNodeOwnerATAAccount = await getAccount(connection, gpuNodeOwnerATA);
    assert(gpuNodeOwnerATAAccount.amount.toString() == "10")
    // assert agent owner balance
    const agentOwnerATAAccount = await getAccount(connection, agentOwnerATA);
    assert(agentOwnerATAAccount.amount.toString() == "10")
    console.info("Customer balance", customerATAAccount.amount.toString())
    console.info("Customer delegated balance", customerATAAccount.delegatedAmount.toString())
    console.info("GPU Node Owner balance", gpuNodeOwnerATAAccount.amount.toString())
    console.info("Agent Owner balance", agentOwnerATAAccount.amount.toString())
  })
});

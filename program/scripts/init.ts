import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { AiTask } from "../target/types/ai_task";
import fs from 'fs'

const quickNodeApiUrl = "https://flashy-delicate-violet.solana-devnet.quiknode.pro/72bbc0b0fab9fc0806a21bec0da46acde5e84d4b/"
const provider = anchor.AnchorProvider.local(quickNodeApiUrl);
anchor.setProvider(provider);
const wallet = provider.wallet as anchor.Wallet;

const program = anchor.workspace.AiTask as Program<AiTask>;

console.log(provider.connection.rpcEndpoint, program.programId.toBase58(), wallet.publicKey.toBase58())

let mint = web3.Keypair.generate();

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

const toSaveAddress = {
    gpuNodeRegistry: gpuNodeRegistry,
    agentRegistry: agentRegistry,
    aiTaskRegistry: aiTaskRegistry,
    delegate: delegate,
    mint: mint.publicKey,
}

program.methods.initialize().accounts({
    signer: wallet.publicKey,
    mint: mint.publicKey,
    gpuNodeRegistry: gpuNodeRegistry,
    agentRegistry: agentRegistry,
    aiTaskRegistry: aiTaskRegistry,
    delegate: delegate,
}).signers([mint]).rpc().then(tx => {
    console.log("Initialized", tx);
    // save the formated address to the file
    fs.writeFileSync('addresses.json', JSON.stringify(toSaveAddress, null, 2))
}).catch(console.error)
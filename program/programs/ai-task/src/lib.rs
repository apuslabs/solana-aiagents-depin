use anchor_lang::{prelude::*};
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount, TransferChecked }};

declare_id!("47VwehJMrzhe4i4JeKX2crv6fKYoEMhZPG8Bv8gRJ27v");

#[error_code]
pub enum CustomError {
    #[msg("The task is already completed.")]
    TaskAlreadyCompleted,
    #[msg("Task not found.")]
    TaskNotFound,
    #[msg("Payer hasn't approve tokens.")]
    PayerNotApproved,
    #[msg("Payer balance is not enough.")]
    PayerBalanceNotEnough,
    #[msg("Payer is not the owner of the task.")]
    PayerNotOwner,
    #[msg("The agent is not found.")]
    AgentNotFound,
    #[msg("The GPU node is not found.")]
    GpuNodeNotFound,
}

#[program]
pub mod ai_task {

    use super::*;
    use std::ops::{Deref, DerefMut};

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn register_gpu_node(ctx: Context<RegisterGpuNode>, node: GpuNode) -> Result<()> {
        let gpu_node_list = ctx.accounts.gpu_node_registry.deref_mut();
        let node_account = ctx.accounts.node.deref_mut();
        node.clone_into(node_account);

        // check if the node already exists
        if let Some(node_key_id_pair) = gpu_node_list.nodes.iter_mut().find(|t| t.id == node_account.id) {
            node_key_id_pair.key = ctx.accounts.node.key();
            return Ok(());
        }
        gpu_node_list.nodes.push(KeyIdPair {
            key: ctx.accounts.node.key(),
            id: node.id,
        });
        Ok(())
    }

    pub fn register_agent(ctx: Context<RegisterAgent>, agent: Agent) -> Result<()> {
        let agent_list = ctx.accounts.agent_registry.deref_mut();
        let agent_account = ctx.accounts.agent.deref_mut();
        agent.clone_into(agent_account);
        // check if the agent already exists
        if let Some(agent_key_id_pair) = agent_list.agents.iter_mut().find(|t| t.id == agent_account.id) {
            agent_key_id_pair.key = ctx.accounts.agent.key();
            return Ok(());
        }
        agent_list.agents.push(KeyIdPair {
            key: ctx.accounts.agent.key(),
            id: agent.id,
        });
        Ok(())
    }

    pub fn submit_task(ctx: Context<SubmitTask>, id: String) -> Result<()> {
        // check if payer delegated to the program
        let payer = &ctx.accounts.payer;
        if !payer.delegate.contains(ctx.accounts.delegate.key) {
            return Err(CustomError::PayerNotApproved.into());
        }


        let new_task = AiTask {
            id: id,
            payer: payer.key(),
            agent_id: ctx.accounts.agent.id.clone(),
            gpu_node_id: ctx.accounts.gpu_node.id.clone(),
            status: "pending".to_string(), // pending, running, completed, failed
            gpu_node_fee: ctx.accounts.gpu_node.price,
            agent_fee: ctx.accounts.agent.price,
            proof_of_work: "".to_string(),
        };

        let task = ctx.accounts.task.deref_mut();
        new_task.clone_into(task);

        let task_list = ctx.accounts.ai_task_registry.deref_mut();
        
        // check if the task already exists and update it if found
        if let Some(task) = task_list.tasks.iter_mut().find(|t| t.id == new_task.id) {
            task.key = ctx.accounts.task.key(); // Update the existing task, no cloning here
            return Ok(());
        }

        // if the task does not exist, push it to global registry
        task_list.tasks.push(KeyIdPair {
            key: ctx.accounts.task.key(),
            id: new_task.id,
        });
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>, proof_of_work: String) -> Result<()> {
        let task_list = ctx.accounts.ai_task_registry.deref();
        let task = ctx.accounts.task.deref_mut();

        // use iter to check if the task exists
        task_list.tasks.iter().find(|t| t.id == task.id).ok_or(CustomError::TaskNotFound)?;

        if task.status != "pending" {
            return Err(CustomError::TaskAlreadyCompleted.into());
        }
        if task.payer != ctx.accounts.payer.key() {
            return Err(CustomError::PayerNotOwner.into());
        }
        // check payer balance
        if !ctx.accounts.payer.delegate.contains(ctx.accounts.delegate.key) {
            return Err(CustomError::PayerNotApproved.into());
        }
        if ctx.accounts.payer.delegated_amount < task.agent_fee + task.gpu_node_fee{
            return Err(CustomError::PayerBalanceNotEnough.into());
        }
        let seeds: &[&[u8]] = &[b"delegate", &[ctx.bumps.get("delegate").unwrap().to_owned()]];
        task.status = "completed".to_string();
        task.proof_of_work = proof_of_work;
        // Transfer tokens to agent and gpu node owners
        token::transfer_checked(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), TransferChecked {
            from: ctx.accounts.payer.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.agent_owner_ata.to_account_info(),
            authority: ctx.accounts.delegate.to_account_info(),
        }, &[seeds]), task.agent_fee, 9).unwrap();
        token::transfer_checked(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), TransferChecked {
            from: ctx.accounts.payer.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.gpu_node_owner_ata.to_account_info(),
            authority: ctx.accounts.delegate.to_account_info(),
        }, &[seeds]), task.gpu_node_fee, 9).unwrap();
        return Ok(());
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init, payer = signer, space = 8 + 4, 
        seeds = [b"gpu_node_registry"], bump,
    )]
    pub gpu_node_registry: Box<Account<'info, GpuNodeList>>,
    #[account(
        init, payer = signer, space = 8 + 4, 
        seeds = [b"agent_registry"], bump,
    )]
    pub agent_registry: Box<Account<'info, AgentList>>,
    #[account(
        init, payer = signer, space = 8 + 4, 
        seeds = [b"task_registry"], bump,
    )]
    pub ai_task_registry: Box<Account<'info, AiTaskList>>,
    #[account(
        init, payer = signer, space = 8,
        seeds = [b"delegate"], bump,
    )]
    /// CHECK: The account is a PDA for the delegate authority, only read by the program
    pub delegate: UncheckedAccount<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 9,
        mint::authority = signer,
    )]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Default, Clone, PartialEq, Eq)]
pub struct KeyIdPair {
    pub key: Pubkey,
    #[max_len(36)]
    pub id: String,
}

#[account]
#[derive(InitSpace, Default)]
pub struct GpuNode {
    #[max_len(36)]
    pub id: String, // uuid v4
    pub owner: Pubkey,
    pub cpu_cores: u8,
    pub memory: u32, // MB
    pub storage: u32, // GB
    #[max_len(16)]
    pub gpu_card_model: String,
    pub price: u64,
    #[max_len(256)]
    pub endpoint: String, // ip or domain
}

#[account]
#[derive(Default)]
pub struct GpuNodeList {
    pub nodes: Vec<KeyIdPair>,
}

impl GpuNodeList {
    pub fn space(len: usize) -> usize {
        8 + 4 + ((len + 1) * 92)
    }
}

#[derive(Accounts)]
#[instruction(node: GpuNode)]
pub struct RegisterGpuNode<'info> {
    #[account(
        mut, 
        seeds = [b"gpu_node_registry"], bump, 
        realloc = 8 + 4 + GpuNodeList::space(gpu_node_registry.nodes.len() as usize), realloc::payer = payer, realloc::zero = false,
    )]
    pub gpu_node_registry: Account<'info, GpuNodeList>,
    #[account(
        init, payer = payer, space = 8 + GpuNode::INIT_SPACE,
    )]
    pub node: Account<'info, GpuNode>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace, Default)]
pub struct Agent {
    #[max_len(36)]
    pub id: String,
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(512)]
    pub desc: String,
    #[max_len(1024)]
    pub poster: String, // image link
    #[max_len(8)]
    pub category: String, // LLM,Image,Audio,Video
    #[max_len(1024)]
    pub docker_image_link: String, // http link
    #[max_len(1024)]
    pub api_doc: String, // http link
    pub docker_default_port: u16,
    pub price: u64,
}

#[account]
pub struct AgentList {
    pub agents: Vec<KeyIdPair>,
}

impl AgentList {
    pub fn space(len: usize) -> usize {
        8 + 4 + ((len + 1) * 92)
    }
}

#[derive(Accounts)]
#[instruction(agent: Agent)]
pub struct RegisterAgent<'info> {
    #[account(
        mut,
        seeds = [b"agent_registry"], bump,
        realloc = AgentList::space(agent_registry.agents.len() as usize), realloc::payer = payer, realloc::zero = false,
    )]
    pub agent_registry: Account<'info, AgentList>,
    #[account(
        init, payer = payer, space = 8 + Agent::INIT_SPACE,
    )]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Default)]
pub struct AiTask {
    #[max_len(36)]
    pub id: String,
    pub payer: Pubkey,
    #[max_len(36)]
    pub agent_id: String,
    #[max_len(36)]
    pub gpu_node_id: String,
    #[max_len(10)]
    pub status: String, // pending, running, completed, failed
    pub gpu_node_fee: u64,
    pub agent_fee: u64,
    #[max_len(1)]
    pub proof_of_work: String, // TODO: define proof of work
}

#[account]
pub struct AiTaskList {
    pub tasks: Vec<KeyIdPair>,
}

impl AiTaskList {
    pub fn space(len: usize) -> usize {
        8 + 4 + ((len + 1) * 92)
    }
    
}

#[derive(Accounts)]
pub struct SubmitTask<'info> {
    pub gpu_node: Account<'info, GpuNode>,
    pub agent: Account<'info, Agent>,
    #[account(
        mut,
        seeds = [b"task_registry"], bump,
        realloc = AiTaskList::space(ai_task_registry.tasks.len() as usize), realloc::payer = signer, realloc::zero = false,
    )]
    pub ai_task_registry: Account<'info, AiTaskList>,
    #[account(
        init, payer = signer, space = 8 + AiTask::INIT_SPACE,
    )]
    pub task: Account<'info, AiTask>,
    pub payer: Account<'info, TokenAccount>,
    #[account(
        seeds = [b"delegate"], bump,
    )]
    /// CHECK: The account is a PDA for the delegate authority, only read by the program
    pub delegate: UncheckedAccount<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(
        seeds = [b"task_registry"], bump,
    )]
    pub ai_task_registry: Account<'info, AiTaskList>,
    #[account(mut)]
    pub task: Account<'info, AiTask>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = gpu_node_owner,
    )]
    pub gpu_node_owner_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = agent_owner,
    )]
    pub agent_owner_ata: Account<'info, TokenAccount>,
    pub gpu_node_owner: SystemAccount<'info>,
    pub agent_owner: SystemAccount<'info>,
    /// CHECK: The account is a PDA for the delegate authority, only read by the program
    #[account(
        seeds = [b"delegate"], bump,
    )]
    pub delegate: UncheckedAccount<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}


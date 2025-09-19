// Solana Program untuk Quest Rewards
// This is a Rust program that will handle real SOL transfers

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111112"); // Replace with real program ID

#[program]
pub mod quest_rewards {
    use super::*;

    pub fn claim_reward(ctx: Context<ClaimReward>, amount: u64) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        let player = &mut ctx.accounts.player;
        
        // Transfer SOL from treasury to player
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: treasury.to_account_info(),
            to: player.to_account_info(),
        };
        
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_instruction,
            ),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub player: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

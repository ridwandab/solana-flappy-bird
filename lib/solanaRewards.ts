import { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

// Treasury wallet (in production, this should be a secure server-side wallet)
const TREASURY_PRIVATE_KEY = process.env.NEXT_PUBLIC_TREASURY_PRIVATE_KEY || ''

export interface RewardTransaction {
  signature: string
  amount: number
  questId: string
  timestamp: number
}

export class SolanaRewardSystem {
  private connection: Connection
  private treasuryKeypair: Keypair | null = null

  constructor(connection: Connection) {
    this.connection = connection
    
    // Initialize treasury wallet if private key is provided
    if (TREASURY_PRIVATE_KEY) {
      try {
        const privateKeyArray = JSON.parse(TREASURY_PRIVATE_KEY)
        this.treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray))
        console.log('Treasury wallet initialized:', this.treasuryKeypair.publicKey.toString())
      } catch (error) {
        console.warn('Failed to initialize treasury wallet:', error)
      }
    }
  }

  /**
   * Send SOL reward to user's wallet
   */
  async sendReward(
    wallet: WalletContextState,
    amount: number,
    questId: string
  ): Promise<RewardTransaction> {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      throw new Error('Wallet not connected')
    }

    if (!this.treasuryKeypair) {
      throw new Error('Treasury wallet not initialized')
    }

    try {
      // Check treasury balance
      const treasuryBalance = await this.connection.getBalance(this.treasuryKeypair.publicKey)
      const requiredLamports = amount * LAMPORTS_PER_SOL
      
      if (treasuryBalance < requiredLamports) {
        throw new Error('Insufficient treasury balance')
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.treasuryKeypair.publicKey,
          toPubkey: wallet.publicKey,
          lamports: requiredLamports,
        })
      )

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.treasuryKeypair.publicKey

      // Sign transaction with treasury wallet
      transaction.sign(this.treasuryKeypair)

      // Send transaction
      const signature = await this.connection.sendRawTransaction(transaction.serialize())
      
      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed')

      console.log(`SOL reward sent: ${amount} SOL to ${wallet.publicKey.toString()}`)
      console.log(`Transaction signature: ${signature}`)

      return {
        signature,
        amount,
        questId,
        timestamp: Date.now()
      }

    } catch (error) {
      console.error('Failed to send SOL reward:', error)
      throw error
    }
  }

  /**
   * Send reward using wallet's sendTransaction (for demo purposes)
   */
  async sendRewardViaWallet(
    wallet: WalletContextState,
    amount: number,
    questId: string
  ): Promise<RewardTransaction> {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      // For demo purposes, we'll create a transaction that sends SOL from user to themselves
      // In production, this would be handled by a backend service
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey, // Send to self for demo
          lamports: 0, // 0 lamports for demo
        })
      )

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, this.connection)
      await this.connection.confirmTransaction(signature, 'confirmed')

      console.log(`Demo reward transaction sent: ${signature}`)

      return {
        signature,
        amount,
        questId,
        timestamp: Date.now()
      }

    } catch (error) {
      console.error('Failed to send demo reward:', error)
      throw error
    }
  }

  /**
   * Check if treasury has sufficient balance
   */
  async checkTreasuryBalance(): Promise<{ balance: number; sufficient: boolean }> {
    if (!this.treasuryKeypair) {
      return { balance: 0, sufficient: false }
    }

    try {
      const balance = await this.connection.getBalance(this.treasuryKeypair.publicKey)
      const balanceSOL = balance / LAMPORTS_PER_SOL
      
      return {
        balance: balanceSOL,
        sufficient: balanceSOL >= 1.0 // At least 1 SOL in treasury
      }
    } catch (error) {
      console.error('Failed to check treasury balance:', error)
      return { balance: 0, sufficient: false }
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getRewardHistory(walletAddress: string): Promise<RewardTransaction[]> {
    try {
      // In production, this would query a database
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Failed to get reward history:', error)
      return []
    }
  }
}

/**
 * Create a new reward system instance
 */
export const createRewardSystem = (connection: Connection): SolanaRewardSystem => {
  return new SolanaRewardSystem(connection)
}

/**
 * Demo function to simulate SOL rewards
 */
export const simulateSOLReward = async (
  wallet: WalletContextState,
  amount: number,
  questId: string
): Promise<RewardTransaction> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Generate fake transaction signature
  const fakeSignature = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`Simulated SOL reward: ${amount} SOL for quest: ${questId}`)
  console.log(`Fake signature: ${fakeSignature}`)
  
  return {
    signature: fakeSignature,
    amount,
    questId,
    timestamp: Date.now()
  }
}

import { Keypair, PublicKey, Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

// Treasury wallet configuration
const TREASURY_WALLET_PRIVATE_KEY = process.env.NEXT_PUBLIC_TREASURY_PRIVATE_KEY || ''

// Real treasury wallet for Solana Flappy Bird
// This wallet should be funded with SOL for real transfers
// Using a different approach - we'll use a funded wallet
const REAL_TREASURY_PRIVATE_KEY = [
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]

// Alternative approach: Use a funded wallet from Solana devnet
// This wallet has been funded with SOL for testing
const FUNDED_TREASURY_PRIVATE_KEY = [
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]

export class TreasuryWallet {
  private keypair: Keypair
  private connection: Connection

  constructor(connection: Connection) {
    // Use funded treasury wallet
    this.keypair = Keypair.fromSecretKey(new Uint8Array(FUNDED_TREASURY_PRIVATE_KEY))
    this.connection = connection
  }

  getPublicKey(): PublicKey {
    return this.keypair.publicKey
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Failed to get treasury balance:', error)
      return 0
    }
  }

  async transferSol(toPublicKey: PublicKey, amount: number): Promise<string> {
    try {
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
      
      // Check if treasury has enough balance
      const treasuryBalance = await this.getBalance()
      console.log(`Treasury balance: ${treasuryBalance} SOL, attempting to transfer: ${amount} SOL`)
      
      if (treasuryBalance < amount) {
        throw new Error(`Insufficient treasury balance. Available: ${treasuryBalance} SOL, Required: ${amount} SOL`)
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.keypair.publicKey,
          toPubkey: toPublicKey,
          lamports: lamports,
        })
      )

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.keypair.publicKey

      // Sign transaction
      transaction.sign(this.keypair)

      // Send transaction
      const signature = await this.connection.sendRawTransaction(transaction.serialize())
      
      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed')

      console.log(`Transfer successful: ${amount} SOL to ${toPublicKey.toString()}, TX: ${signature}`)
      return signature
    } catch (error) {
      console.error('Transfer failed:', error)
      throw error
    }
  }

  // For demo purposes - simulate transfer without actual SOL
  async simulateTransfer(toPublicKey: PublicKey, amount: number): Promise<string> {
    console.log(`Simulating transfer of ${amount} SOL to ${toPublicKey.toString()}`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return a simulated transaction signature
    return `simulated-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Helper function to create treasury wallet instance
export const createTreasuryWallet = (connection: Connection): TreasuryWallet => {
  return new TreasuryWallet(connection)
}

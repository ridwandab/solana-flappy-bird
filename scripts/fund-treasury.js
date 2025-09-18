const { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js')

// Treasury wallet private key (same as in treasuryWallet.ts)
const TREASURY_PRIVATE_KEY = [
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]

async function fundTreasury() {
  try {
    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    // Create treasury wallet
    const treasuryWallet = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY))
    
    console.log('Treasury Wallet Address:', treasuryWallet.publicKey.toString())
    
    // Check current balance
    const balance = await connection.getBalance(treasuryWallet.publicKey)
    console.log('Current Treasury Balance:', balance / LAMPORTS_PER_SOL, 'SOL')
    
    if (balance < 1 * LAMPORTS_PER_SOL) {
      console.log('Treasury needs funding. Please send SOL to:', treasuryWallet.publicKey.toString())
      console.log('You can use Solana CLI: solana transfer', treasuryWallet.publicKey.toString(), '1 --from <your-wallet>')
      console.log('Or use a faucet: https://faucet.solana.com/')
    } else {
      console.log('Treasury is funded and ready for transfers!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the function
fundTreasury()

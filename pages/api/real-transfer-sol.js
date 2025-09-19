// Real SOL Transfer API Endpoint
// This will handle actual Solana transactions with proper authentication

const { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js')

// Treasury wallet private key (should be stored securely in environment variables)
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY_NEW 
  ? JSON.parse(process.env.TREASURY_PRIVATE_KEY_NEW)
  : process.env.TREASURY_PRIVATE_KEY 
    ? JSON.parse(process.env.TREASURY_PRIVATE_KEY)
    : null

// API key for authentication (should be stored securely)
const API_KEY = process.env.API_KEY_NEW || process.env.API_KEY || 'your-secure-api-key'

export default async function handler(req, res) {
  console.log('Real Transfer SOL API called:', req.method, req.body)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check API key for authentication
    const { apiKey, playerWallet, amount } = req.body
    
    if (apiKey !== API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    // Validate input
    if (!playerWallet || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid input parameters' })
    }

    if (!TREASURY_PRIVATE_KEY) {
      return res.status(500).json({ error: 'Treasury wallet not configured' })
    }

    // Connect to Solana devnet
    console.log('Connecting to Solana devnet...')
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    // Create treasury wallet
    const treasuryWallet = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY))
    console.log('Treasury wallet:', treasuryWallet.publicKey.toString())
    
    // Validate player wallet address
    let playerPublicKey
    try {
      playerPublicKey = new PublicKey(playerWallet)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid player wallet address' })
    }

    // Check treasury balance
    const treasuryBalance = await connection.getBalance(treasuryWallet.publicKey)
    const treasuryBalanceSOL = treasuryBalance / LAMPORTS_PER_SOL
    
    console.log(`Treasury balance: ${treasuryBalanceSOL} SOL, attempting to transfer: ${amount} SOL`)
    
    if (treasuryBalanceSOL < amount + 0.01) { // Add buffer for transaction fees
      return res.status(400).json({ 
        error: `Insufficient treasury balance. Available: ${treasuryBalanceSOL} SOL, Required: ${amount} SOL` 
      })
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryWallet.publicKey,
        toPubkey: playerPublicKey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    )

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = treasuryWallet.publicKey

    // Sign transaction
    transaction.sign(treasuryWallet)

    // Send transaction
    const signature = await connection.sendRawTransaction(transaction.serialize())
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed')

    console.log(`Real transfer successful: ${amount} SOL to ${playerWallet}, TX: ${signature}`)

    return res.status(200).json({
      success: true,
      amount: amount,
      transactionId: signature,
      playerWallet: playerWallet,
      timestamp: new Date().toISOString(),
      simulated: false,
      note: 'Real Solana transaction completed successfully'
    })

  } catch (error) {
    console.error('Real transfer failed:', error)
    return res.status(500).json({ 
      error: 'Transfer failed', 
      details: error.message 
    })
  }
}

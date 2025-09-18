const { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js')

// Treasury wallet private key (same as in treasuryWallet.ts)
const TREASURY_PRIVATE_KEY = [
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]

export default async function handler(req, res) {
  console.log('Transfer SOL API called:', req.method, req.body)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { playerWallet, amount } = req.body
    console.log('Request data:', { playerWallet, amount })

    // Validate input
    if (!playerWallet || !amount || amount <= 0) {
      console.log('Invalid input parameters:', { playerWallet, amount })
      return res.status(400).json({ error: 'Invalid input parameters' })
    }

    // Connect to Solana devnet
    console.log('Connecting to Solana devnet...')
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    console.log('Connected to Solana devnet')
    
    // Create treasury wallet
    console.log('Creating treasury wallet...')
    const treasuryWallet = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY))
    console.log('Treasury wallet created:', treasuryWallet.publicKey.toString())
    
    // Validate player wallet address
    console.log('Validating player wallet address...')
    let playerPublicKey
    try {
      playerPublicKey = new PublicKey(playerWallet)
      console.log('Player wallet validated:', playerPublicKey.toString())
    } catch (error) {
      console.log('Invalid player wallet address:', error.message)
      return res.status(400).json({ error: 'Invalid player wallet address' })
    }

    // Check treasury balance
    console.log('Checking treasury balance...')
    const treasuryBalance = await connection.getBalance(treasuryWallet.publicKey)
    const treasuryBalanceSOL = treasuryBalance / LAMPORTS_PER_SOL
    
    console.log(`Treasury balance: ${treasuryBalanceSOL} SOL, attempting to transfer: ${amount} SOL`)
    
    if (treasuryBalanceSOL < amount) {
      console.log('Insufficient treasury balance')
      return res.status(400).json({ 
        error: `Insufficient treasury balance. Available: ${treasuryBalanceSOL} SOL, Required: ${amount} SOL` 
      })
    }

    // Create transaction
    console.log('Creating transaction...')
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: treasuryWallet.publicKey,
        toPubkey: playerPublicKey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    )
    console.log('Transaction created')

    // Get recent blockhash
    console.log('Getting recent blockhash...')
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = treasuryWallet.publicKey
    console.log('Blockhash set:', blockhash)

    // Sign transaction
    console.log('Signing transaction...')
    transaction.sign(treasuryWallet)
    console.log('Transaction signed')

    // Send transaction
    console.log('Sending transaction...')
    const signature = await connection.sendRawTransaction(transaction.serialize())
    console.log('Transaction sent, signature:', signature)
    
    // Confirm transaction
    console.log('Confirming transaction...')
    await connection.confirmTransaction(signature, 'confirmed')
    console.log('Transaction confirmed')

    console.log(`Transfer successful: ${amount} SOL to ${playerWallet}, TX: ${signature}`)

    return res.status(200).json({
      success: true,
      amount: amount,
      transactionId: signature,
      playerWallet: playerWallet,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Transfer failed:', error)
    return res.status(500).json({ 
      error: 'Transfer failed', 
      details: error.message 
    })
  }
}

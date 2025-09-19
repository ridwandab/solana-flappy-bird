// Test Transfer Endpoint
// This will help debug transfer issues

const { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js')

// Treasury wallet private key
const TREASURY_PRIVATE_KEY = [103,54,38,189,137,65,198,250,186,31,236,186,89,20,43,123,5,176,125,253,75,6,90,240,157,156,250,177,221,216,225,148,172,178,103,214,239,100,230,228,218,176,255,53,78,237,145,10,134,32,15,110,254,62,46,247,78,160,210,160,21,90,36,66]

export default async function handler(req, res) {
  console.log('Test Transfer API called:', req.method, req.body)
  
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

    // Check player balance before transfer
    console.log('Checking player balance before transfer...')
    const playerBalanceBefore = await connection.getBalance(playerPublicKey)
    const playerBalanceBeforeSOL = playerBalanceBefore / LAMPORTS_PER_SOL
    console.log(`Player balance before: ${playerBalanceBeforeSOL} SOL`)

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

    // Check player balance after transfer
    console.log('Checking player balance after transfer...')
    const playerBalanceAfter = await connection.getBalance(playerPublicKey)
    const playerBalanceAfterSOL = playerBalanceAfter / LAMPORTS_PER_SOL
    console.log(`Player balance after: ${playerBalanceAfterSOL} SOL`)
    
    const balanceIncrease = playerBalanceAfterSOL - playerBalanceBeforeSOL
    console.log(`Balance increase: ${balanceIncrease} SOL`)

    console.log(`Test transfer successful: ${amount} SOL to ${playerWallet}, TX: ${signature}`)

    return res.status(200).json({
      success: true,
      amount: amount,
      transactionId: signature,
      playerWallet: playerWallet,
      timestamp: new Date().toISOString(),
      simulated: false,
      note: 'Test transfer completed successfully',
      balances: {
        treasuryBefore: treasuryBalanceSOL,
        treasuryAfter: (await connection.getBalance(treasuryWallet.publicKey)) / LAMPORTS_PER_SOL,
        playerBefore: playerBalanceBeforeSOL,
        playerAfter: playerBalanceAfterSOL,
        balanceIncrease: balanceIncrease
      }
    })

  } catch (error) {
    console.error('Test transfer failed:', error)
    return res.status(500).json({ 
      error: 'Transfer failed', 
      details: error.message 
    })
  }
}

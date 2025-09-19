// Fund Treasury Wallet Script
// This will fund the treasury wallet with SOL for real transfers

const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function fundTreasury() {
  console.log('🚀 Funding Treasury Wallet...');
  
  // Treasury wallet private key
  const TREASURY_PRIVATE_KEY = [103,54,38,189,137,65,198,250,186,31,236,186,89,20,43,123,5,176,125,253,75,6,90,240,157,156,250,177,221,216,225,148,172,178,103,214,239,100,230,228,218,176,255,53,78,237,145,10,134,32,15,110,254,62,46,247,78,160,210,160,21,90,36,66];
  
  try {
    // Connect to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    console.log('✅ Connected to Solana devnet');
    
    // Create treasury wallet
    const treasuryWallet = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY));
    console.log('✅ Treasury wallet created:', treasuryWallet.publicKey.toString());
    
    // Check current balance
    const currentBalance = await connection.getBalance(treasuryWallet.publicKey);
    const currentBalanceSOL = currentBalance / LAMPORTS_PER_SOL;
    console.log('💰 Current balance:', currentBalanceSOL, 'SOL');
    
    if (currentBalanceSOL < 1) {
      console.log('🔄 Requesting airdrop...');
      
      // Request airdrop
      const airdropSignature = await connection.requestAirdrop(
        treasuryWallet.publicKey,
        2 * LAMPORTS_PER_SOL // 2 SOL
      );
      
      console.log('⏳ Airdrop transaction:', airdropSignature);
      console.log('🔄 Confirming transaction...');
      
      // Confirm transaction
      await connection.confirmTransaction(airdropSignature, 'confirmed');
      
      // Check new balance
      const newBalance = await connection.getBalance(treasuryWallet.publicKey);
      const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
      
      console.log('✅ Airdrop successful!');
      console.log('💰 New balance:', newBalanceSOL, 'SOL');
      
    } else {
      console.log('✅ Treasury wallet already has sufficient balance');
    }
    
    console.log('\n🎉 Treasury wallet is ready for real transfers!');
    console.log('📍 Treasury Address:', treasuryWallet.publicKey.toString());
    console.log('💰 Balance:', (await connection.getBalance(treasuryWallet.publicKey)) / LAMPORTS_PER_SOL, 'SOL');
    
  } catch (error) {
    console.error('❌ Failed to fund treasury wallet:', error);
  }
}

fundTreasury();

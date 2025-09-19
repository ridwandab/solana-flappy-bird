const { Connection, Keypair } = require('@solana/web3.js');

// Treasury wallet private key
const TREASURY_PRIVATE_KEY = [103,54,38,189,137,65,198,250,186,31,236,186,89,20,43,123,5,176,125,253,75,6,90,240,157,156,250,177,221,216,225,148,172,178,103,214,239,100,230,228,218,176,255,53,78,237,145,10,134,32,15,110,254,62,46,247,78,160,210,160,21,90,36,66];

async function checkTreasuryBalance() {
    console.log('🔍 Checking Treasury Wallet Balance...');
    
    try {
        // Connect to Solana devnet
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('✅ Connected to Solana devnet');
        
        // Create treasury wallet
        const treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY));
        const treasuryPublicKey = treasuryKeypair.publicKey;
        console.log('✅ Treasury wallet address:', treasuryPublicKey.toString());
        
        // Check balance
        const balance = await connection.getBalance(treasuryPublicKey);
        const balanceSOL = balance / 1000000000; // Convert lamports to SOL
        
        console.log(`💰 Treasury balance: ${balance} lamports`);
        console.log(`💰 Treasury balance: ${balanceSOL} SOL`);
        
        if (balanceSOL < 0.01) {
            console.log('⚠️ WARNING: Treasury balance is very low!');
            console.log('🔄 Requesting airdrop...');
            
            const airdropSignature = await connection.requestAirdrop(
                treasuryPublicKey,
                2 * 1000000000 // Request 2 SOL
            );
            
            console.log('⏳ Airdrop transaction:', airdropSignature);
            await connection.confirmTransaction(airdropSignature, 'confirmed');
            
            const newBalance = await connection.getBalance(treasuryPublicKey);
            const newBalanceSOL = newBalance / 1000000000;
            
            console.log('✅ Airdrop successful!');
            console.log(`💰 New treasury balance: ${newBalanceSOL} SOL`);
        } else {
            console.log('✅ Treasury has sufficient balance for transfers');
        }
        
    } catch (error) {
        console.error('❌ Error checking treasury balance:', error);
    }
}

checkTreasuryBalance();

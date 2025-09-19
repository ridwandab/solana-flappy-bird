const { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js');

// Treasury wallet private key
const TREASURY_PRIVATE_KEY = [103,54,38,189,137,65,198,250,186,31,236,186,89,20,43,123,5,176,125,253,75,6,90,240,157,156,250,177,221,216,225,148,172,178,103,214,239,100,230,228,218,176,255,53,78,237,145,10,134,32,15,110,254,62,46,247,78,160,210,160,21,90,36,66];

// Test player wallet (you can replace this with your actual wallet address)
const TEST_PLAYER_WALLET = "11111111111111111111111111111112"; // System program address for testing

async function testDirectTransfer() {
    console.log('🧪 Testing Direct SOL Transfer...');
    
    try {
        // Connect to Solana devnet
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('✅ Connected to Solana devnet');
        
        // Create treasury wallet
        const treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY));
        const treasuryPublicKey = treasuryKeypair.publicKey;
        console.log('✅ Treasury wallet address:', treasuryPublicKey.toString());
        
        // Create test player wallet
        const playerPublicKey = new PublicKey(TEST_PLAYER_WALLET);
        console.log('✅ Test player wallet address:', playerPublicKey.toString());
        
        // Check balances before transfer
        console.log('\n📊 Checking balances BEFORE transfer...');
        const treasuryBalanceBefore = await connection.getBalance(treasuryPublicKey);
        const playerBalanceBefore = await connection.getBalance(playerPublicKey);
        
        console.log(`💰 Treasury balance before: ${treasuryBalanceBefore / LAMPORTS_PER_SOL} SOL`);
        console.log(`💰 Player balance before: ${playerBalanceBefore / LAMPORTS_PER_SOL} SOL`);
        
        // Test transfer amount
        const transferAmount = 0.001; // 0.001 SOL
        console.log(`\n🔄 Attempting to transfer ${transferAmount} SOL...`);
        
        // Check if treasury has enough balance
        if (treasuryBalanceBefore < transferAmount * LAMPORTS_PER_SOL) {
            console.log('❌ Insufficient treasury balance for transfer');
            return;
        }
        
        // Create transaction
        console.log('📝 Creating transaction...');
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: treasuryPublicKey,
                toPubkey: playerPublicKey,
                lamports: Math.floor(transferAmount * LAMPORTS_PER_SOL),
            })
        );
        
        // Get recent blockhash
        console.log('🔗 Getting recent blockhash...');
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = treasuryPublicKey;
        
        // Sign transaction
        console.log('✍️ Signing transaction...');
        transaction.sign(treasuryKeypair);
        
        // Send transaction
        console.log('📤 Sending transaction...');
        const signature = await connection.sendRawTransaction(transaction.serialize());
        console.log('📋 Transaction signature:', signature);
        
        // Confirm transaction
        console.log('⏳ Confirming transaction...');
        await connection.confirmTransaction(signature, 'confirmed');
        console.log('✅ Transaction confirmed!');
        
        // Check balances after transfer
        console.log('\n📊 Checking balances AFTER transfer...');
        const treasuryBalanceAfter = await connection.getBalance(treasuryPublicKey);
        const playerBalanceAfter = await connection.getBalance(playerPublicKey);
        
        console.log(`💰 Treasury balance after: ${treasuryBalanceAfter / LAMPORTS_PER_SOL} SOL`);
        console.log(`💰 Player balance after: ${playerBalanceAfter / LAMPORTS_PER_SOL} SOL`);
        
        // Calculate actual changes
        const treasuryChange = (treasuryBalanceBefore - treasuryBalanceAfter) / LAMPORTS_PER_SOL;
        const playerChange = (playerBalanceAfter - playerBalanceBefore) / LAMPORTS_PER_SOL;
        
        console.log('\n📈 Transfer Results:');
        console.log(`📉 Treasury decreased by: ${treasuryChange} SOL`);
        console.log(`📈 Player increased by: ${playerChange} SOL`);
        console.log(`🎯 Expected transfer: ${transferAmount} SOL`);
        
        // Verify transfer success
        if (Math.abs(playerChange - transferAmount) < 0.0001) {
            console.log('✅ SUCCESS: Transfer completed correctly!');
            console.log('✅ SOL successfully entered player wallet!');
        } else {
            console.log('❌ FAILED: Transfer amount mismatch!');
            console.log(`❌ Expected: ${transferAmount} SOL, Received: ${playerChange} SOL`);
        }
        
        // Get transaction details
        console.log('\n🔍 Transaction Details:');
        const transactionInfo = await connection.getTransaction(signature);
        if (transactionInfo) {
            console.log(`📋 Slot: ${transactionInfo.slot}`);
            console.log(`⏰ Block Time: ${new Date(transactionInfo.blockTime * 1000).toISOString()}`);
            console.log(`✅ Success: ${transactionInfo.meta?.err === null ? 'YES' : 'NO'}`);
            console.log(`💸 Fee: ${transactionInfo.meta?.fee / LAMPORTS_PER_SOL} SOL`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testDirectTransfer();

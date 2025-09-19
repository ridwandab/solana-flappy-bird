// Create Treasury Wallet Script
// This will create a valid treasury wallet for real SOL transfers

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

console.log('🚀 Creating Treasury Wallet for Real SOL Transfer...');

// Generate new keypair
const treasuryWallet = Keypair.generate();

console.log('✅ Treasury wallet created!');
console.log('📍 Public Key:', treasuryWallet.publicKey.toString());
console.log('🔑 Private Key Array:', JSON.stringify(Array.from(treasuryWallet.secretKey)));

// Save wallet to file
const walletData = {
  publicKey: treasuryWallet.publicKey.toString(),
  secretKey: Array.from(treasuryWallet.secretKey)
};

fs.writeFileSync('treasury-wallet.json', JSON.stringify(walletData, null, 2));
console.log('💾 Wallet saved to: treasury-wallet.json');

// Generate API key
const crypto = require('crypto');
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('🔐 API Key:', apiKey);

// Create environment file
const envContent = `# Real SOL Transfer Configuration
TREASURY_PRIVATE_KEY=[${Array.from(treasuryWallet.secretKey).join(',')}]
API_KEY=${apiKey}
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
`;

fs.writeFileSync('.env.local', envContent);
console.log('📄 Environment file created: .env.local');

console.log('\n🎉 Setup Complete!');
console.log('═══════════════════════════════════════════════════════════════');
console.log('📍 Treasury Address:', treasuryWallet.publicKey.toString());
console.log('🔑 Private Key Array:', `[${Array.from(treasuryWallet.secretKey).join(',')}]`);
console.log('🔐 API Key:', apiKey);
console.log('═══════════════════════════════════════════════════════════════');

console.log('\n📋 Next Steps:');
console.log('1. Fund the treasury wallet with SOL:');
console.log(`   solana airdrop 2 ${treasuryWallet.publicKey.toString()}`);
console.log('2. Set environment variables in Vercel:');
console.log(`   vercel env add TREASURY_PRIVATE_KEY production`);
console.log(`   vercel env add API_KEY production`);
console.log('3. Deploy to production:');
console.log('   vercel --prod');
console.log('4. Test real transfer with API key:', apiKey);

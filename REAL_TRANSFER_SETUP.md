# Real SOL Transfer Setup Guide

## 🚀 Cara Setup Transfer SOL yang Benar-benar Real

### **1. Buat Treasury Wallet**

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Generate new wallet
solana-keygen new --outfile ~/treasury-wallet.json

# Set network ke devnet
solana config set --url https://api.devnet.solana.com

# Check balance
solana balance ~/treasury-wallet.json

# Request airdrop (jika balance 0)
solana airdrop 2 ~/treasury-wallet.json
```

### **2. Setup Environment Variables**

Buat file `.env.local`:

```env
# Real SOL Transfer Configuration
TREASURY_PRIVATE_KEY=[your_private_key_array_here]
API_KEY=your-secure-api-key-here
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### **3. Fund Treasury Wallet**

```bash
# Transfer SOL ke treasury wallet
solana transfer ~/treasury-wallet.json <amount> --from <your_main_wallet>

# Atau request airdrop
solana airdrop 10 ~/treasury-wallet.json
```

### **4. Deploy ke Vercel**

```bash
# Set environment variables di Vercel
vercel env add TREASURY_PRIVATE_KEY
vercel env add API_KEY

# Deploy
vercel --prod
```

### **5. Test Real Transfer**

1. Connect wallet di game
2. Complete quest dan claim reward
3. Click "Transfer to Wallet (Real)"
4. Enter API key
5. Confirm transfer
6. Check wallet balance

## 🔧 Troubleshooting

### **Error: Insufficient Balance**
- Fund treasury wallet dengan SOL
- Check treasury balance: `solana balance ~/treasury-wallet.json`

### **Error: Invalid API Key**
- Set API_KEY di environment variables
- Use same API key di frontend

### **Error: Transaction Failed**
- Check Solana network status
- Ensure treasury wallet has enough SOL for fees
- Verify wallet addresses are correct

## 💡 Tips

1. **Start Small**: Test dengan amount kecil dulu
2. **Monitor Balance**: Always check treasury balance
3. **Backup Wallet**: Backup treasury wallet private key
4. **Use Devnet**: Test di devnet sebelum mainnet
5. **Rate Limiting**: Implement rate limiting untuk prevent abuse

## 🚨 Security Notes

- **Never commit private keys** ke git
- **Use environment variables** untuk sensitive data
- **Implement API key authentication**
- **Monitor transfer logs** untuk suspicious activity
- **Set transfer limits** untuk prevent large losses

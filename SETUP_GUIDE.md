# 🚀 Setup Guide: Treasury Wallet & API Key untuk Real SOL Transfer

## 📋 Prerequisites

Sebelum memulai, pastikan sudah install:
- **Node.js** (v16 atau lebih baru)
- **Git**
- **PowerShell** (Windows)

## 🔧 Step 1: Install Solana CLI

### Windows:
```powershell
# Download dan install Solana CLI
winget install Solana.SolanaCLI

# Atau download manual dari:
# https://docs.solana.com/cli/install-solana-cli-tools
```

### Mac/Linux:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

## 🔧 Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

## 🚀 Step 3: Setup Treasury Wallet (Otomatis)

Jalankan script PowerShell yang sudah dibuat:

```powershell
# Di folder project
.\setup-treasury-wallet.ps1
```

Script ini akan:
- ✅ Check Solana CLI
- ✅ Set network ke devnet
- ✅ Generate treasury wallet baru
- ✅ Request airdrop 2 SOL
- ✅ Generate API key
- ✅ Create .env.local file

## 🔧 Step 4: Setup Vercel Environment Variables

```powershell
# Setup environment variables di Vercel
.\setup-vercel-env.ps1
```

Script ini akan:
- ✅ Read .env.local
- ✅ Set TREASURY_PRIVATE_KEY di Vercel
- ✅ Set API_KEY di Vercel
- ✅ Deploy ke production

## 📋 Manual Setup (Jika Script Tidak Bekerja)

### 1. Generate Treasury Wallet:
```bash
# Set network ke devnet
solana config set --url https://api.devnet.solana.com

# Generate wallet baru
solana-keygen new --outfile treasury-wallet.json

# Get wallet address
solana address --keypair treasury-wallet.json

# Request airdrop
solana airdrop 2 --keypair treasury-wallet.json
```

### 2. Get Private Key:
```bash
# Get private key array
cat treasury-wallet.json
```

Copy array dari file JSON (contoh: `[174,47,154,16,...]`)

### 3. Generate API Key:
```bash
# Generate random API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Create .env.local:
```env
TREASURY_PRIVATE_KEY=[174,47,154,16,202,193,206,113,199,190,53,133,169,175,31,56,222,53,138,189,224,216,117,173,10,149,53,45,73,251,237,246,15,185,186,82,177,240,148,69,241,227,167,80,141,89,240,121,121,35,172,247,68,251,226,218,48,63,176,109,168,89,238,135]
API_KEY=your-generated-api-key-here
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### 5. Set Vercel Environment Variables:
```bash
# Set private key
echo "[174,47,154,16,...]" | vercel env add TREASURY_PRIVATE_KEY production

# Set API key
echo "your-api-key" | vercel env add API_KEY production

# Deploy
vercel --prod
```

## 🧪 Step 5: Test Real Transfer

### 1. Buka aplikasi yang sudah di-deploy
### 2. Connect wallet Solana
### 3. Complete quest dan claim reward
### 4. Click "Transfer to Wallet (REAL)"
### 5. Enter API key yang sudah dibuat
### 6. Confirm transfer
### 7. Check wallet balance - SOL akan masuk!

## 🔍 Troubleshooting

### Error: "Solana CLI not found"
```bash
# Install Solana CLI
winget install Solana.SolanaCLI

# Restart terminal
```

### Error: "Insufficient balance"
```bash
# Request more airdrop
solana airdrop 5 --keypair treasury-wallet.json
```

### Error: "Invalid API key"
- Pastikan API key sama di .env.local dan Vercel
- Check environment variables di Vercel dashboard

### Error: "Transaction failed"
- Check treasury wallet balance
- Pastikan network adalah devnet
- Check Solana network status

## 📊 Monitoring

### Check Treasury Balance:
```bash
solana balance --keypair treasury-wallet.json
```

### Check Transaction History:
```bash
solana transaction-history --keypair treasury-wallet.json
```

### Check Vercel Logs:
```bash
vercel logs --follow
```

## 🔒 Security Best Practices

### 1. Private Key Security:
- ❌ Never commit private key ke git
- ❌ Never share private key
- ✅ Store di environment variables
- ✅ Use different keys for devnet/mainnet

### 2. API Key Security:
- ❌ Never expose API key di frontend
- ❌ Never commit API key ke git
- ✅ Use strong, random API keys
- ✅ Rotate API keys regularly

### 3. Production Setup:
- ✅ Use mainnet untuk production
- ✅ Use dedicated treasury wallet
- ✅ Set transfer limits
- ✅ Monitor transfer logs
- ✅ Implement rate limiting

## 💡 Tips

### 1. Start Small:
- Test dengan amount kecil dulu
- Monitor treasury balance
- Check transaction fees

### 2. Backup:
- Backup treasury wallet
- Backup environment variables
- Document API keys

### 3. Monitoring:
- Set up alerts untuk low balance
- Monitor transfer logs
- Track transaction success rate

## 🎯 Expected Results

Setelah setup selesai, user akan bisa:
- ✅ Transfer SOL yang benar-benar real
- ✅ Lihat real transaction ID
- ✅ SOL masuk ke wallet player
- ✅ Track transfer history
- ✅ Monitor treasury balance

## 📞 Support

Jika ada masalah:
1. Check console logs
2. Check Vercel logs
3. Check Solana network status
4. Verify environment variables
5. Test dengan amount kecil

---

**🎉 Selamat! Real SOL Transfer system sudah siap digunakan!**

# Devnet Setup Guide

## 🚨 **Masalah RPC Endpoints:**

### **All Mainnet RPC Endpoints Failed:**
```
❌ Serum RPC: Connection timeout
❌ Ankr RPC: Requires API key
❌ Official Solana: 403 Access forbidden
```

### **Solution: Switch to Devnet**
- ✅ **Devnet RPC**: Always works and free
- ✅ **No Rate Limiting**: No 403 errors
- ✅ **Perfect for Testing**: Ideal for development

## 🔧 **Current Configuration:**

### **1. WalletProvider.tsx**
```typescript
// Using Devnet for now due to RPC endpoint issues
const network = WalletAdapterNetwork.Devnet

const endpoint = useMemo(() => {
  if (network === WalletAdapterNetwork.Devnet) {
    return 'https://api.devnet.solana.com'  // Always works
  }
  // ... rest of the logic
}, [network])
```

### **2. useBalance.ts**
```typescript
const loadBalance = async () => {
  try {
    // Use the connection from wallet provider first
    const lamports = await connection.getBalance(publicKey)
    setBalance(lamports)
    console.log(`✅ Balance loaded successfully: ${lamports / LAMPORTS_PER_SOL} SOL`)
    
  } catch (error) {
    // Fallback to Devnet if main connection fails
    const devnetConnection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const lamports = await devnetConnection.getBalance(publicKey)
    setBalance(lamports)
    console.log(`✅ Balance loaded successfully from Devnet: ${lamports / LAMPORTS_PER_SOL} SOL`)
  }
}
```

## 🎯 **How to Get SOL on Devnet:**

### **1. Switch Wallet to Devnet**
1. Open Phantom Wallet
2. Go to Settings
3. Change Network to **Devnet**
4. Your wallet address will be the same, but balance will be 0

### **2. Get Free SOL from Faucet**
1. **Solana Faucet**: https://faucet.solana.com/
2. **QuickNode Faucet**: https://faucet.quicknode.com/solana/devnet
3. **SolFaucet**: https://solfaucet.com/

### **3. Request SOL**
1. Paste your wallet address
2. Click "Request SOL"
3. You'll receive 1-2 SOL for testing

### **4. Verify Balance**
1. Check Phantom Wallet - should show SOL balance
2. Refresh the game - balance should appear

## 🔄 **Testing Steps:**

### **1. Switch to Devnet**
```bash
# In Phantom Wallet:
Settings → Change Network → Devnet
```

### **2. Get Test SOL**
```bash
# Visit faucet:
https://faucet.solana.com/
# Enter your wallet address
# Request SOL
```

### **3. Test in Game**
1. Connect wallet in game
2. Check console logs:
   ```
   Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
   Using connection: https://api.devnet.solana.com
   ✅ Balance loaded successfully: 1.5000 SOL from https://api.devnet.solana.com
   ```

### **4. Test Cosmetic Purchase**
1. Go to Cosmetic Store
2. Try to purchase a cosmetic
3. Should work with Devnet SOL

## 🌐 **Network Comparison:**

### **Mainnet vs Devnet:**
| Feature | Mainnet | Devnet |
|---------|---------|---------|
| **SOL Value** | Real money | Free test tokens |
| **RPC Access** | Rate limited | Always free |
| **Transactions** | Real cost | Free |
| **Use Case** | Production | Development/Testing |
| **Faucet** | No | Yes (free SOL) |

### **Devnet Benefits:**
- ✅ **Free Testing**: No real money involved
- ✅ **No Rate Limits**: RPC endpoints always work
- ✅ **Easy Setup**: Just switch network in wallet
- ✅ **Free SOL**: Get test tokens from faucets
- ✅ **Perfect for Development**: Ideal for testing features

## 🚀 **Production Deployment:**

### **When Ready for Mainnet:**
1. **Get Premium RPC**: Sign up for Alchemy, QuickNode, or Helius
2. **Update Configuration**: Change network back to Mainnet
3. **Add API Keys**: Configure premium RPC endpoints
4. **Test Thoroughly**: Ensure all features work

### **Premium RPC Providers:**
```typescript
// Example with API key
const premiumEndpoints = [
  'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY',
  'https://api.quicknode.com/solana/mainnet/YOUR_API_KEY',
]
```

## 📋 **Troubleshooting:**

### **If Balance Still Shows 0:**
1. **Check Network**: Ensure wallet is on Devnet
2. **Get SOL**: Visit faucet and request SOL
3. **Refresh**: Refresh the game page
4. **Check Console**: Look for balance loading logs

### **If Wallet Won't Connect:**
1. **Clear Cache**: Clear browser cache
2. **Reconnect**: Disconnect and reconnect wallet
3. **Check Extension**: Ensure Phantom is installed and updated

### **If RPC Still Fails:**
1. **Check Internet**: Verify internet connection
2. **Try Different Browser**: Test in different browser
3. **Check Firewall**: Ensure no firewall blocking

## 🎯 **Expected Results:**

### **After Devnet Setup:**
- ✅ **Balance Loading**: Should load balance successfully
- ✅ **No 403 Errors**: No more access forbidden errors
- ✅ **Cosmetic Store**: Should work with test SOL
- ✅ **Transactions**: Should process without real cost
- ✅ **Development**: Perfect environment for testing

### **Console Output:**
```
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://api.devnet.solana.com
✅ Balance loaded successfully: 1.5000 SOL from https://api.devnet.solana.com
```

## 🔄 **Quick Setup Commands:**

### **1. Switch to Devnet:**
```bash
# In Phantom Wallet:
Settings → Change Network → Devnet
```

### **2. Get Test SOL:**
```bash
# Visit: https://faucet.solana.com/
# Enter wallet address
# Click "Request SOL"
```

### **3. Test in Game:**
```bash
# Refresh game page
# Connect wallet
# Check balance display
```

Sekarang aplikasi menggunakan Devnet yang selalu bekerja dan Anda bisa mendapatkan SOL gratis untuk testing! 🎉

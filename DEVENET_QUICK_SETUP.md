# Devnet Quick Setup Guide

## 🚨 **Problem: All Mainnet RPC Endpoints Blocked**

### **Current Issues:**
```
❌ Official Solana: 403 Access forbidden
❌ Ankr RPC: API key not allowed (403)
❌ Serum RPC: Connection issues
❌ All endpoints failing with 403 errors
```

### **Solution: Switch to Devnet for Testing**

## 🔧 **Step 1: Switch Wallet to Devnet**

### **Phantom Wallet:**
1. **Open Phantom Wallet**
2. **Click Settings** (gear icon)
3. **Select "Change Network"**
4. **Choose "Devnet"**
5. **Your wallet address stays the same**

### **Other Wallets:**
- **Solflare**: Settings → Network → Devnet
- **Backpack**: Settings → Network → Devnet
- **Glow**: Settings → Network → Devnet

## 🎯 **Step 2: Get Free SOL from Faucet**

### **Option 1: Solana Faucet (Recommended)**
1. **Visit**: https://faucet.solana.com/
2. **Enter your wallet address**
3. **Click "Request SOL"**
4. **You'll receive 1-2 SOL for testing**

### **Option 2: QuickNode Faucet**
1. **Visit**: https://faucet.quicknode.com/solana/devnet
2. **Enter your wallet address**
3. **Click "Request SOL"**
4. **You'll receive test SOL**

### **Option 3: SolFaucet**
1. **Visit**: https://solfaucet.com/
2. **Select "Devnet"**
3. **Enter your wallet address**
4. **Click "Request SOL"**

## 🚀 **Step 3: Test in Game**

### **Expected Results:**
```
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://api.devnet.solana.com
✅ Balance loaded successfully: 1.5000 SOL from https://api.devnet.solana.com
```

### **Testing Steps:**
1. **Refresh the game page**
2. **Connect your wallet**
3. **Check balance display** (should show SOL from faucet)
4. **Go to Cosmetic Store**
5. **Try purchasing a cosmetic** (should work with test SOL)

## 🔄 **Step 4: Switch Back to Mainnet (When Ready)**

### **For Production:**
1. **Get API Key**: Sign up for Alchemy/QuickNode/Helius
2. **Add to .env.local**: `NEXT_PUBLIC_SOLANA_RPC_URL=https://...`
3. **Change network back to Mainnet**
4. **Test with real SOL**

## 📋 **Devnet vs Mainnet Comparison:**

| Feature | Devnet | Mainnet |
|---------|---------|---------|
| **SOL Value** | Free test tokens | Real money |
| **RPC Access** | Always free | Requires API key |
| **Transactions** | Free | Real cost |
| **Use Case** | Development/Testing | Production |
| **Faucet** | Yes (free SOL) | No |

## 🎯 **Benefits of Devnet:**

### **For Development:**
- ✅ **Free Testing**: No real money involved
- ✅ **No Rate Limits**: RPC endpoints always work
- ✅ **Easy Setup**: Just switch network in wallet
- ✅ **Free SOL**: Get test tokens from faucets
- ✅ **Perfect for Testing**: All features work the same

### **For Learning:**
- ✅ **Safe Environment**: No risk of losing real money
- ✅ **Unlimited Testing**: Get more SOL anytime
- ✅ **Same Features**: All game features work identically
- ✅ **Real Transactions**: Learn how Solana works

## 🚨 **Important Notes:**

### **Devnet SOL:**
- ❌ **Not Real Money**: Devnet SOL has no real value
- ❌ **Can't Transfer**: Can't send to Mainnet
- ❌ **Resets**: Devnet resets periodically
- ✅ **Free**: Get as much as you need for testing

### **Wallet Address:**
- ✅ **Same Address**: Your wallet address stays the same
- ✅ **Same Private Key**: No need to create new wallet
- ✅ **Easy Switch**: Just change network setting

## 🔧 **Troubleshooting:**

### **If Balance Still Shows 0:**
1. **Check Network**: Ensure wallet is on Devnet
2. **Get SOL**: Visit faucet and request SOL
3. **Refresh**: Refresh the game page
4. **Check Console**: Look for balance loading logs

### **If Faucet Not Working:**
1. **Try Different Faucet**: Use alternative faucet
2. **Check Address**: Ensure wallet address is correct
3. **Wait**: Sometimes faucet takes time to process
4. **Try Again**: Request SOL again

### **If Game Not Loading:**
1. **Clear Cache**: Clear browser cache
2. **Refresh**: Hard refresh the page (Ctrl+F5)
3. **Check Console**: Look for error messages
4. **Try Different Browser**: Test in different browser

## 🎯 **Quick Commands:**

### **Switch to Devnet:**
```bash
# In Phantom Wallet:
Settings → Change Network → Devnet
```

### **Get Test SOL:**
```bash
# Visit: https://faucet.solana.com/
# Enter wallet address
# Click "Request SOL"
```

### **Test in Game:**
```bash
# Refresh game page
# Connect wallet
# Check balance display
# Test cosmetic purchase
```

## 🚀 **Expected Results:**

### **After Devnet Setup:**
- ✅ **Balance Loading**: Should load balance successfully
- ✅ **No 403 Errors**: No more access forbidden errors
- ✅ **Cosmetic Store**: Should work with test SOL
- ✅ **Transactions**: Should process without real cost
- ✅ **All Features**: Everything works the same as Mainnet

### **Console Output:**
```
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://api.devnet.solana.com
✅ Balance loaded successfully: 1.5000 SOL from https://api.devnet.solana.com
```

## 🔄 **Next Steps:**

### **For Development:**
1. **Test All Features**: Ensure everything works on Devnet
2. **Get More SOL**: Request more SOL from faucet as needed
3. **Develop Features**: Build and test new features
4. **Switch to Mainnet**: When ready for production

### **For Production:**
1. **Get API Key**: Sign up for premium RPC provider
2. **Add Environment Variables**: Set up custom RPC
3. **Test on Mainnet**: Ensure everything works with real SOL
4. **Deploy**: Launch with Mainnet configuration

Sekarang aplikasi menggunakan Devnet yang selalu bekerja! Switch wallet ke Devnet, dapatkan SOL gratis dari faucet, dan test semua fitur game. 🎉

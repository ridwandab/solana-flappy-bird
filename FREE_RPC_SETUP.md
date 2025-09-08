# Free RPC Setup Guide

## 🚨 **Current Issues:**

### **All RPC Endpoints Failing:**
```
❌ Phantom RPC: CORS error (blocked from localhost)
❌ Helius Demo: Invalid API key (401)
❌ Official Solana: 403 Access forbidden
❌ Ankr RPC: Requires API key for mainnet
```

### **Solution: Get Free API Keys**

## 🔑 **Free RPC Providers:**

### **1. Alchemy (Recommended)**
- ✅ **Free Tier**: 300M compute units/month
- ✅ **No Credit Card**: Required for signup
- ✅ **Reliable**: Enterprise-grade infrastructure

#### **Setup Steps:**
1. **Visit**: https://www.alchemy.com/
2. **Sign Up**: Create free account
3. **Create App**: Select "Solana" → "Mainnet"
4. **Get API Key**: Copy the HTTP URL
5. **Add to App**: Use in environment variables

#### **API Key Format:**
```
https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### **2. QuickNode**
- ✅ **Free Tier**: 25M requests/month
- ✅ **No Credit Card**: Required for signup
- ✅ **Fast**: Global CDN

#### **Setup Steps:**
1. **Visit**: https://www.quicknode.com/
2. **Sign Up**: Create free account
3. **Create Endpoint**: Select "Solana" → "Mainnet"
4. **Get URL**: Copy the HTTP URL
5. **Add to App**: Use in environment variables

#### **API Key Format:**
```
https://api.quicknode.com/solana/mainnet/YOUR_API_KEY
```

### **3. Helius**
- ✅ **Free Tier**: 100K requests/month
- ✅ **No Credit Card**: Required for signup
- ✅ **Solana-Focused**: Built for Solana

#### **Setup Steps:**
1. **Visit**: https://www.helius.dev/
2. **Sign Up**: Create free account
3. **Create Project**: Select "Solana" → "Mainnet"
4. **Get API Key**: Copy the HTTP URL
5. **Add to App**: Use in environment variables

#### **API Key Format:**
```
https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

## 🔧 **Implementation:**

### **1. Create .env.local File**
```bash
# Create file: .env.local
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### **2. Update WalletProvider.tsx**
```typescript
const endpoint = useMemo(() => {
  if (network === WalletAdapterNetwork.Mainnet) {
    // Use custom RPC if provided
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    }
    
    // Fallback to free endpoints
    const mainnetEndpoints = [
      'https://rpc.ankr.com/solana',                   // Ankr RPC (Free tier)
      'https://solana-api.projectserum.com',           // Serum RPC
      'https://api.mainnet-beta.solana.com',           // Official Solana
    ]
    return mainnetEndpoints[0]
  }
  // ... rest of the logic
}, [network])
```

### **3. Update useBalance.ts**
```typescript
const fallbackEndpoints = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL,              // Custom RPC (if provided)
  'https://rpc.ankr.com/solana',                       // Ankr RPC (Free tier)
  'https://solana-api.projectserum.com',               // Serum RPC
  'https://api.mainnet-beta.solana.com',               // Official Solana
].filter(Boolean) // Remove undefined values
```

## 🎯 **Quick Setup (5 Minutes):**

### **Step 1: Get Alchemy API Key**
1. **Visit**: https://www.alchemy.com/
2. **Sign Up**: Use email (no credit card required)
3. **Create App**: Select "Solana" → "Mainnet"
4. **Copy URL**: Copy the HTTP URL

### **Step 2: Add to Project**
1. **Create**: `.env.local` file in project root
2. **Add**: `NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`
3. **Restart**: Development server

### **Step 3: Test**
1. **Refresh**: Application
2. **Connect**: Wallet
3. **Check**: Console logs for successful balance loading

## 📋 **Alternative Solutions:**

### **Option 1: Use Devnet (No API Key Required)**
```typescript
// Switch to Devnet for testing
const network = WalletAdapterNetwork.Devnet

// Get free SOL from faucet
// Visit: https://faucet.solana.com/
```

### **Option 2: Use Wallet's Built-in RPC**
```typescript
// Let wallet handle RPC connection
// Remove custom RPC configuration
// Use wallet's default connection
```

### **Option 3: Use Public RPC (Limited)**
```typescript
// Use public RPC endpoints (may have rate limits)
const publicEndpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
]
```

## 🚀 **Expected Results:**

### **With API Key:**
```
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
✅ Balance loaded successfully: 1.2345 SOL from https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### **Without API Key (Fallback):**
```
❌ Failed to load balance from wallet connection: Error: 403
Trying fallback RPC: https://rpc.ankr.com/solana
✅ Balance loaded successfully from https://rpc.ankr.com/solana: 1.2345 SOL
```

## 🔄 **Troubleshooting:**

### **If Still Getting 403 Errors:**
1. **Get API Key**: Sign up for Alchemy/QuickNode/Helius
2. **Add to .env.local**: Set `NEXT_PUBLIC_SOLANA_RPC_URL`
3. **Restart Server**: `npm run dev`
4. **Test Again**: Check console logs

### **If API Key Not Working:**
1. **Check Format**: Ensure URL is correct
2. **Check Network**: Ensure using Mainnet endpoint
3. **Check Limits**: Ensure not exceeding free tier limits
4. **Try Different Provider**: Switch to QuickNode or Helius

### **If All Else Fails:**
1. **Switch to Devnet**: For testing purposes
2. **Get Free SOL**: From faucet
3. **Test Features**: All functionality works on Devnet
4. **Switch Back**: When ready for production

## 🎯 **Recommended Approach:**

### **For Development:**
1. **Get Alchemy API Key**: Free, reliable, no credit card
2. **Add to .env.local**: Set environment variable
3. **Test Thoroughly**: Ensure all features work
4. **Deploy**: With API key for production

### **For Production:**
1. **Upgrade Plan**: Consider paid plans for higher limits
2. **Multiple Providers**: Use multiple RPC providers for redundancy
3. **Monitor Usage**: Track API usage and limits
4. **Fallback System**: Ensure fallback endpoints work

Sekarang Anda bisa mendapatkan API key gratis dari Alchemy, QuickNode, atau Helius untuk mengatasi masalah RPC endpoints! 🎉

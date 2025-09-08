# Network Configuration Guide

## 🔧 **Solana Network Configuration**

### **Masalah yang Diperbaiki:**
- ❌ **Sebelum**: Aplikasi menggunakan Devnet, wallet Phantom menggunakan Mainnet
- ✅ **Sesudah**: Aplikasi dikonfigurasi untuk Mainnet dengan RPC endpoints yang reliable

## 🌐 **Network Settings:**

### **1. Mainnet Configuration**
```typescript
// WalletProvider.tsx
const network = WalletAdapterNetwork.Mainnet

const endpoint = useMemo(() => {
  if (network === WalletAdapterNetwork.Mainnet) {
    return 'https://api.mainnet-beta.solana.com'
  } else if (network === WalletAdapterNetwork.Devnet) {
    return 'https://api.devnet.solana.com'
  } else {
    return clusterApiUrl(network)
  }
}, [network])
```

### **2. Supported Wallets**
- ✅ **Phantom Wallet** (Primary)
- ✅ **Solflare Wallet**
- ✅ **Backpack Wallet**
- ✅ **Glow Wallet**

## 🔍 **Troubleshooting Balance Issues:**

### **1. Check Network Mismatch**
```bash
# Pastikan wallet dan aplikasi menggunakan network yang sama
# Phantom Wallet: Mainnet (default)
# Aplikasi: Mainnet (updated)
```

### **2. RPC Endpoint Issues**
```typescript
// Jika masih ada masalah, coba RPC endpoints alternatif:
const endpoints = [
  'https://api.mainnet-beta.solana.com',           // Official Solana
  'https://solana-api.projectserum.com',           // Serum
  'https://rpc.ankr.com/solana',                   // Ankr
  'https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY' // Alchemy (requires API key)
]
```

### **3. Debug Information**
```typescript
// Console logs untuk debugging:
console.log(`Loading balance for wallet: ${publicKey.toString()}`)
console.log(`Using RPC endpoint: ${connection.rpcEndpoint}`)
console.log(`✅ Balance loaded successfully: ${lamports / LAMPORTS_PER_SOL} SOL`)
```

## 🛠️ **Manual Testing Steps:**

### **1. Check Wallet Connection**
1. Buka browser console (F12)
2. Connect wallet di aplikasi
3. Periksa console logs untuk:
   - Wallet address
   - RPC endpoint
   - Balance loading status

### **2. Test Balance Loading**
1. Klik tombol refresh balance (🔄)
2. Periksa console untuk error messages
3. Jika ada error, coba RPC endpoint yang berbeda

### **3. Network Verification**
1. Buka Phantom Wallet
2. Periksa network setting (Mainnet/Devnet)
3. Pastikan aplikasi menggunakan network yang sama

## 🔄 **Alternative RPC Endpoints:**

### **Free Endpoints:**
```typescript
const freeEndpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
]
```

### **Premium Endpoints (Requires API Key):**
```typescript
const premiumEndpoints = [
  'https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY',
  'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY',
  'https://api.quicknode.com/solana/mainnet/YOUR_KEY'
]
```

## 📝 **Environment Variables (Optional):**

### **Create .env.local:**
```bash
# Optional: Custom RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Optional: Network selection
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

### **Update WalletProvider.tsx:**
```typescript
const endpoint = useMemo(() => {
  // Use custom RPC if provided
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL
  }
  
  // Default endpoints
  if (network === WalletAdapterNetwork.Mainnet) {
    return 'https://api.mainnet-beta.solana.com'
  }
  // ... rest of the logic
}, [network])
```

## 🎯 **Expected Results:**

### **After Fix:**
- ✅ **Balance Display**: Menampilkan saldo yang benar dari wallet
- ✅ **Network Match**: Aplikasi dan wallet menggunakan network yang sama
- ✅ **Error Handling**: Clear error messages jika ada masalah
- ✅ **Manual Refresh**: Tombol refresh untuk update balance manual
- ✅ **Debug Info**: Console logs untuk troubleshooting

### **Console Output Example:**
```
Loading balance for wallet: 87cv...WbBG
Using RPC endpoint: https://api.mainnet-beta.solana.com
✅ Balance loaded successfully: 1.2345 SOL
```

## 🚨 **Common Issues & Solutions:**

### **Issue 1: Balance Still Shows 0**
**Solution**: 
1. Check network mismatch (Mainnet vs Devnet)
2. Try different RPC endpoint
3. Check wallet connection status

### **Issue 2: RPC Errors**
**Solution**:
1. Use alternative RPC endpoints
2. Check internet connection
3. Try manual refresh

### **Issue 3: Wallet Not Connecting**
**Solution**:
1. Check browser wallet extension
2. Try different wallet (Solflare, Backpack)
3. Clear browser cache

Sekarang aplikasi dikonfigurasi untuk Mainnet dan seharusnya menampilkan saldo yang benar dari wallet Phantom Anda! 🎉

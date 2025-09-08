# Balance Troubleshooting Guide

## 🚨 **Masalah: Balance Masih Menampilkan 0 SOL**

### **Kemungkinan Penyebab:**
1. **Network Mismatch**: Wallet di Mainnet, aplikasi di Devnet (atau sebaliknya)
2. **RPC Endpoint Issues**: Semua RPC endpoints gagal
3. **Wallet Connection**: Wallet tidak terhubung dengan benar
4. **Cache Issues**: Browser cache atau wallet cache

## 🔧 **Solusi Step-by-Step:**

### **Step 1: Check Network Match**

#### **Option A: Switch Wallet ke Mainnet (Recommended)**
1. **Buka Phantom Wallet**
2. **Klik Settings** (gear icon)
3. **Pilih "Change Network"**
4. **Pilih "Mainnet"**
5. **Refresh aplikasi**

#### **Option B: Switch Aplikasi ke Devnet**
1. **Buka file**: `components/wallet/WalletProvider.tsx`
2. **Ubah line 23**:
   ```typescript
   const network = WalletAdapterNetwork.Devnet  // Change to Devnet
   ```
3. **Get SOL di Devnet**:
   - Visit: https://faucet.solana.com/
   - Enter wallet address
   - Request SOL

### **Step 2: Check Console Logs**

#### **Buka Browser Console (F12)**
1. **Refresh aplikasi**
2. **Connect wallet**
3. **Check console untuk logs**:
   ```
   Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
   Using connection: https://solana-mainnet.phantom.app
   ✅ Balance loaded successfully: 1.2345 SOL from https://solana-mainnet.phantom.app
   ```

#### **Jika Ada Error:**
```
❌ Failed to load balance from wallet connection: Error: 403
Trying fallback RPC: https://solana-mainnet.phantom.app
✅ Balance loaded successfully from https://solana-mainnet.phantom.app: 1.2345 SOL
```

### **Step 3: Manual Refresh**

#### **Klik Tombol Refresh (🔄)**
1. **Di Cosmetic Store**
2. **Klik tombol refresh** di sebelah balance
3. **Check console logs**
4. **Balance should update**

### **Step 4: Clear Cache**

#### **Clear Browser Cache:**
1. **Ctrl + Shift + Delete**
2. **Select "All Time"**
3. **Check "Cached images and files"**
4. **Click "Clear data"**
5. **Refresh aplikasi**

#### **Clear Wallet Cache:**
1. **Disconnect wallet** di aplikasi
2. **Close browser**
3. **Reopen browser**
4. **Reconnect wallet**

## 🌐 **Current RPC Configuration:**

### **Primary Endpoints:**
```typescript
const mainnetEndpoints = [
  'https://solana-mainnet.phantom.app',            // Phantom's own RPC
  'https://rpc.helius.xyz/?api-key=demo',          // Helius Demo (Free)
  'https://api.mainnet-beta.solana.com',           // Official Solana
]
```

### **Fallback System:**
```typescript
// Try each endpoint until one succeeds
for (const endpoint of fallbackEndpoints) {
  try {
    const fallbackConnection = new Connection(endpoint, 'confirmed')
    const lamports = await fallbackConnection.getBalance(publicKey)
    
    setBalance(lamports)
    console.log(`✅ Balance loaded successfully from ${endpoint}`)
    return // Success!
    
  } catch (fallbackError) {
    console.warn(`❌ Failed to load balance from ${endpoint}:`, fallbackError)
    continue // Try next endpoint
  }
}
```

## 🎯 **Testing Steps:**

### **1. Verify Network Match**
```bash
# Check wallet network
Phantom Wallet → Settings → Change Network → Mainnet

# Check app network
components/wallet/WalletProvider.tsx → line 23 → Mainnet
```

### **2. Test Balance Loading**
```bash
# Open browser console (F12)
# Connect wallet
# Check console logs for balance loading
```

### **3. Test Manual Refresh**
```bash
# Click refresh button (🔄) next to balance
# Check console logs
# Balance should update
```

### **4. Test Fallback System**
```bash
# If primary RPC fails, should try fallback endpoints
# Check console for fallback attempts
# Should eventually succeed
```

## 🔍 **Debug Information:**

### **Console Logs to Look For:**
```
✅ Good logs:
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://solana-mainnet.phantom.app
✅ Balance loaded successfully: 1.2345 SOL from https://solana-mainnet.phantom.app

❌ Error logs:
❌ Failed to load balance from wallet connection: Error: 403
Trying fallback RPC: https://solana-mainnet.phantom.app
✅ Balance loaded successfully from https://solana-mainnet.phantom.app: 1.2345 SOL
```

### **Common Error Messages:**
```
❌ Error: 403 - Access forbidden
❌ Error: Failed to fetch
❌ Error: Connection timeout
❌ Error: API key is not allowed
```

## 🚀 **Quick Fixes:**

### **Fix 1: Network Mismatch**
```bash
# Make sure wallet and app use same network
Wallet: Mainnet
App: Mainnet
```

### **Fix 2: RPC Issues**
```bash
# App will automatically try fallback endpoints
# Check console for which endpoint works
```

### **Fix 3: Cache Issues**
```bash
# Clear browser cache
# Disconnect and reconnect wallet
# Refresh application
```

### **Fix 4: Wallet Connection**
```bash
# Disconnect wallet
# Close browser
# Reopen browser
# Reconnect wallet
```

## 📋 **Troubleshooting Checklist:**

### **Before Testing:**
- [ ] Wallet is connected
- [ ] Network matches (Mainnet = Mainnet)
- [ ] Browser console is open (F12)
- [ ] No browser cache issues

### **During Testing:**
- [ ] Check console logs
- [ ] Try manual refresh
- [ ] Check error messages
- [ ] Verify wallet balance in Phantom

### **After Testing:**
- [ ] Balance displays correctly
- [ ] No error messages
- [ ] Can purchase cosmetics
- [ ] Balance updates after purchase

## 🎯 **Expected Results:**

### **Success Scenario:**
```
Loading balance for wallet: 87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG
Using connection: https://solana-mainnet.phantom.app
✅ Balance loaded successfully: 1.2345 SOL from https://solana-mainnet.phantom.app
```

### **Fallback Scenario:**
```
❌ Failed to load balance from wallet connection: Error: 403
Trying fallback RPC: https://solana-mainnet.phantom.app
✅ Balance loaded successfully from https://solana-mainnet.phantom.app: 1.2345 SOL
```

## 🔄 **If Still Not Working:**

### **Try These Steps:**
1. **Check wallet balance** di Phantom Wallet
2. **Verify network** di wallet dan aplikasi
3. **Clear all cache** (browser + wallet)
4. **Try different browser**
5. **Check internet connection**
6. **Try different wallet** (Solflare)

### **Last Resort:**
1. **Switch to Devnet** untuk testing
2. **Get free SOL** dari faucet
3. **Test semua fitur** di Devnet
4. **Switch back to Mainnet** ketika ready

Sekarang aplikasi menggunakan Phantom's own RPC endpoint yang seharusnya lebih reliable! Coba refresh aplikasi dan check console logs. 🎉

# 🔧 Buat File .env.local

## ❌ **Masalah yang Ditemukan:**
File `.env.local` tidak ada! Ini adalah alasan mengapa database menampilkan "Not Connected".

## ✅ **Solusi:**

### **Langkah 1: Buat File .env.local**
1. **Buka folder project**: `SOLANA-FLAPPY-BIRD`
2. **Buat file baru** dengan nama: `.env.local`
3. **Copy dan paste** isi berikut:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yqxafphtxatnrxswnpje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Game Configuration
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_treasury_wallet_address
NEXT_PUBLIC_GAME_MIN_SCORE_TO_SAVE=10

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

### **Langkah 2: Dapatkan Supabase Anon Key**
1. **Buka**: https://supabase.com/dashboard
2. **Login** ke akun Supabase
3. **Pilih project**: `solana-flappy-bird`
4. **Klik**: Settings → API
5. **Copy** "anon public" key
6. **Ganti** `your_supabase_anon_key_here` dengan key yang dicopy

### **Langkah 3: Restart Development Server**
```bash
# Stop server (Ctrl+C)
# Start server lagi
npm run dev
```

## 🎯 **Hasil yang Diharapkan:**
- Database status berubah dari "❌ Not Connected" menjadi "✅ Connected"
- Player names dan high scores bisa disimpan ke Supabase
- Game berfungsi dengan database yang terhubung

## 🔍 **Troubleshooting:**
- Pastikan file `.env.local` ada di folder `SOLANA-FLAPPY-BIRD`
- Pastikan tidak ada spasi ekstra di nama file
- Pastikan anon key sudah benar (bukan placeholder)
- Restart development server setelah membuat file

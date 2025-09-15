# 🔑 Cara Mendapatkan Supabase Anon Key

## ❌ **Masalah Saat Ini:**
File `.env.local` sudah dibuat, tapi `NEXT_PUBLIC_SUPABASE_ANON_KEY` masih menggunakan placeholder `your_supabase_anon_key_here`.

## ✅ **Solusi Step-by-Step:**

### **Langkah 1: Buka Supabase Dashboard**
1. **Buka browser** dan kunjungi: https://supabase.com/dashboard
2. **Login** ke akun Supabase Anda
3. **Pilih project**: `solana-flappy-bird`

### **Langkah 2: Akses API Settings**
1. **Klik** "Settings" di sidebar kiri
2. **Klik** "API" di menu Settings
3. **Scroll ke bawah** sampai menemukan bagian "Project API keys"

### **Langkah 3: Copy Anon Key**
1. **Cari** bagian "anon public" key
2. **Klik** tombol "Copy" di sebelah anon key
3. **Key akan ter-copy** ke clipboard

### **Langkah 4: Update .env.local**
1. **Buka file** `.env.local` di folder `SOLANA-FLAPPY-BIRD`
2. **Ganti** baris ini:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. **Dengan** (paste anon key yang sudah dicopy):
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Langkah 5: Restart Development Server**
1. **Stop server** (tekan Ctrl+C di terminal)
2. **Start server lagi**:
   ```bash
   npm run dev
   ```

## 🎯 **Hasil yang Diharapkan:**
- Database status berubah dari "❌ Not Connected" menjadi "✅ Connected"
- Player names dan high scores bisa disimpan ke Supabase

## 🔍 **Troubleshooting:**
- **Pastikan anon key tidak ada spasi** di awal atau akhir
- **Pastikan anon key dimulai dengan** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Restart development server** setelah mengubah .env.local
- **Cek browser console** untuk error messages

## 📱 **Screenshot Lokasi Anon Key:**
Anon key biasanya terletak di:
- Settings → API → Project API keys → anon public
- Key dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- Panjang key sekitar 100+ karakter

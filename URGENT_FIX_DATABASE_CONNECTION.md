# 🚨 URGENT: Fix Database Connection

## ❌ **Masalah Saat Ini:**
Database masih menampilkan "❌ Not Connected" karena anon key belum diganti!

## 🔍 **Status Saat Ini:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
**❌ Masih menggunakan placeholder!**

## ✅ **SOLUSI CEPAT:**

### **Langkah 1: Buka Supabase Dashboard**
1. **Klik link ini**: https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/settings/api
2. **Login** ke akun Supabase
3. **Scroll ke bawah** sampai menemukan "Project API keys"

### **Langkah 2: Copy Anon Key**
1. **Cari** bagian "anon public" key
2. **Klik** tombol "Copy" (ikon clipboard)
3. **Key akan ter-copy** ke clipboard

### **Langkah 3: Edit File .env.local**
1. **Buka file** `.env.local` di folder `SOLANA-FLAPPY-BIRD`
2. **Ganti baris ini**:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. **Dengan** (paste anon key yang sudah dicopy):
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeGFmcGh0eGF0bnJ4c3ducGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzQ4MDAsImV4cCI6MjA1MjU1MDgwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### **Langkah 4: Restart Development Server**
1. **Stop server** (tekan Ctrl+C di terminal)
2. **Start server lagi**:
   ```bash
   npm run dev
   ```

## 🎯 **Hasil yang Diharapkan:**
- Database status berubah dari "❌ Not Connected" menjadi "✅ Connected"
- Player names dan high scores bisa disimpan ke Supabase

## 🔍 **Troubleshooting:**
- **Pastikan anon key dimulai dengan** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- **Pastikan tidak ada spasi** di awal atau akhir key
- **Restart development server** setelah mengubah .env.local
- **Cek browser console** untuk error messages

## 📱 **Lokasi Anon Key di Dashboard:**
- **URL**: https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/settings/api
- **Lokasi**: Settings → API → Project API keys → anon public
- **Format**: Key panjang yang dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

## ⚠️ **PENTING:**
- **Jangan gunakan** `your_supabase_anon_key_here`
- **Gunakan anon key yang benar** dari Supabase dashboard
- **Restart server** setelah mengubah .env.local

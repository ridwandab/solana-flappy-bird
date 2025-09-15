# 🔑 Cara Mendapatkan Supabase Anon Key

## 📋 Langkah-langkah Mendapatkan Anon Key

### **Langkah 1: Buka Supabase Dashboard**
1. **Kunjungi**: https://supabase.com/dashboard
2. **Login** ke akun Supabase Anda
3. **Pilih project**: `solana-flappy-bird`

### **Langkah 2: Buka Settings → API**
1. **Klik menu "Settings"** di sidebar kiri
2. **Klik "API"** di menu Settings
3. **Scroll ke bawah** ke bagian "Project API keys"

### **Langkah 3: Copy Anon Key**
1. **Cari "anon public" key** (bukan service_role key)
2. **Klik tombol "Copy"** di sebelah anon key
3. **Anon key** biasanya dimulai dengan `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Panjang anon key** sekitar 100+ karakter

### **Langkah 4: Update .env.local**
1. **Buka file** `.env.local` di root project
2. **Ganti baris**:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
3. **Dengan anon key yang sebenarnya**:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Langkah 5: Restart Development Server**
1. **Stop server** (Ctrl+C di terminal)
2. **Start server lagi**:
   ```bash
   npm run dev
   ```

## 🔍 Cara Verifikasi Anon Key

### **Check 1: Browser Console**
Buka browser console dan lihat:
```
🔍 Supabase availability check: true
✅ Supabase configured correctly with URL: https://yqxafphtxatnrxswnpje.supabase.co
```

### **Check 2: Debug Tool**
1. **Buka game** di browser
2. **Scroll ke bawah** di menu utama
3. **Klik "Test Supabase"** button
4. **Lihat hasil** di debug panel

### **Check 3: Network Tab**
1. **Buka browser DevTools**
2. **Klik tab "Network"**
3. **Play game** dan dapatkan score
4. **Lihat request** ke Supabase API

## ⚠️ Troubleshooting

### **Jika Anon Key Tidak Bekerja:**
1. **Pastikan anon key** dimulai dengan `eyJ`
2. **Pastikan panjang** sekitar 100+ karakter
3. **Pastikan tidak ada spasi** di awal/akhir
4. **Restart development server** setelah update

### **Jika Masih Error:**
1. **Check browser console** untuk error messages
2. **Verify URL** di .env.local
3. **Check Supabase dashboard** untuk project status
4. **Try generate new anon key** di Supabase

## 📊 Expected Results

Setelah anon key dikonfigurasi dengan benar:

1. **Browser console** menunjukkan: `Supabase availability check: true`
2. **Debug tool** menunjukkan: `Database connection successful`
3. **Data tersimpan** ke tabel `high_scores` dan `player_names`
4. **Leaderboard** menampilkan data dari Supabase

## 🆘 Support

Jika masih ada masalah:
1. **Check browser console** untuk error messages
2. **Use debug tool** di menu utama
3. **Verify anon key** di Supabase dashboard
4. **Restart development server** setelah perubahan

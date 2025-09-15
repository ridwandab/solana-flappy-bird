# 🚀 Panduan Setup Supabase untuk Solana Flappy Bird

## 📋 Langkah-langkah Setup

### 1. **Dapatkan Anon Key dari Supabase Dashboard**

1. **Buka**: https://supabase.com/dashboard
2. **Login** ke akun Supabase Anda
3. **Pilih project**: `solana-flappy-bird` (URL: https://yqxafphtxatnrxswnpje.supabase.co)
4. **Klik**: Settings → API
5. **Copy**: "anon public" key (bukan service_role key)
6. **Contoh anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (panjang sekitar 100+ karakter)

### 2. **Update Environment Variables**

Edit file `.env.local` di root project:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://yqxafphtxatnrxswnpje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Ganti dengan anon key yang sebenarnya

# Game Configuration
NEXT_PUBLIC_GAME_TREASURY_ADDRESS=your_treasury_wallet_address
NEXT_PUBLIC_GAME_MIN_SCORE_TO_SAVE=10
```

### 3. **Setup Database Schema**

Buka **SQL Editor** di dashboard Supabase dan jalankan script berikut:

```sql
-- 1. Buat tabel high_scores
CREATE TABLE IF NOT EXISTS high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat tabel player_names
CREATE TABLE IF NOT EXISTS player_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT UNIQUE NOT NULL,
  player_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_high_scores_player_address ON high_scores(player_address);
CREATE INDEX IF NOT EXISTS idx_high_scores_player_name ON high_scores(player_name);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_timestamp ON high_scores(timestamp DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_names ENABLE ROW LEVEL SECURITY;

-- 5. Buat policy untuk public access
DROP POLICY IF EXISTS "Allow public read access" ON high_scores;
CREATE POLICY "Allow public read access" ON high_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON high_scores;
CREATE POLICY "Allow public insert" ON high_scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access" ON player_names;
CREATE POLICY "Allow public read access" ON player_names FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON player_names;
CREATE POLICY "Allow public insert" ON player_names FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON player_names;
CREATE POLICY "Allow public update" ON player_names FOR UPDATE USING (true);
```

### 4. **Restart Development Server**

Setelah update `.env.local`:

```bash
# Stop development server (Ctrl+C)
# Start again
npm run dev
```

### 5. **Test Koneksi**

1. **Buka game** di browser
2. **Connect wallet**
3. **Scroll ke bawah** di menu utama
4. **Klik "Test Supabase"** button
5. **Lihat hasil** di console dan debug panel

## 🔍 Troubleshooting

### **Jika Data Tidak Masuk ke Supabase:**

#### **Check 1: Environment Variables**
```bash
# Pastikan .env.local berisi:
NEXT_PUBLIC_SUPABASE_URL=https://yqxafphtxatnrxswnpje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Bukan placeholder
```

#### **Check 2: Browser Console**
Buka browser console dan lihat:
```
🔍 Supabase availability check: true
✅ Supabase configured correctly with URL: https://yqxafphtxatnrxswnpje.supabase.co
```

#### **Check 3: Database Schema**
Pastikan tabel sudah dibuat dengan benar:
- `high_scores` (6 columns)
- `player_names` (5 columns)
- RLS enabled
- Policies created

#### **Check 4: Network Tab**
Buka browser Network tab dan lihat:
- Request ke Supabase API
- Response status (200 OK)
- Error messages

### **Jika Modal Nama Muncul Lagi:**

1. **Clear browser cache**
2. **Check sessionStorage** di browser DevTools
3. **Restart development server**
4. **Check console** untuk error messages

## 📊 Cara Melihat Data di Supabase

### **1. Melihat Data di Dashboard**
1. **Buka**: https://supabase.com/dashboard
2. **Pilih project**: `solana-flappy-bird`
3. **Klik**: Database → Tables
4. **Klik tabel**: `high_scores` atau `player_names`
5. **Lihat data** di tab "Data"

### **2. Query Data dengan SQL**
Buka **SQL Editor** dan jalankan:

```sql
-- Lihat semua high scores
SELECT * FROM high_scores ORDER BY score DESC LIMIT 10;

-- Lihat semua player names
SELECT * FROM player_names ORDER BY created_at DESC;

-- Lihat high scores dengan nama player
SELECT 
  h.player_name,
  h.score,
  h.timestamp,
  h.player_address
FROM high_scores h
ORDER BY h.score DESC
LIMIT 10;
```

## 🎯 Expected Results

Setelah setup selesai:

1. **Player name** tersimpan di tabel `player_names`
2. **High scores** tersimpan di tabel `high_scores`
3. **Leaderboard** menampilkan data dari Supabase
4. **Modal nama** tidak muncul lagi setelah sudah ada nama
5. **Data persist** antara session

## 🆘 Support

Jika masih ada masalah:

1. **Check browser console** untuk error messages
2. **Use debug tool** di menu utama
3. **Verify environment variables** di `.env.local`
4. **Check Supabase dashboard** untuk data
5. **Restart development server** setelah perubahan

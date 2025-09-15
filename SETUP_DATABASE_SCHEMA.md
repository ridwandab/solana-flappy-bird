# 🗄️ Setup Database Schema di Supabase

## 📋 Langkah-langkah Membuat Tabel Database

### **Langkah 1: Buka SQL Editor di Supabase**
1. **Buka**: https://supabase.com/dashboard
2. **Login** ke akun Supabase
3. **Pilih project**: `solana-flappy-bird`
4. **Klik**: SQL Editor (di sidebar kiri)

### **Langkah 2: Jalankan Script SQL**
Copy dan paste script berikut ke SQL Editor, lalu klik **"Run"**:

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

### **Langkah 3: Verifikasi Tabel Dibuat**
1. **Klik**: Database → Tables (di sidebar kiri)
2. **Pastikan** ada 2 tabel:
   - `high_scores` (6 columns)
   - `player_names` (5 columns)

### **Langkah 4: Test Insert Data (Opsional)**
Untuk test apakah tabel berfungsi, jalankan script ini:

```sql
-- Test insert data
INSERT INTO player_names (player_address, player_name) 
VALUES ('test123', 'TestPlayer');

INSERT INTO high_scores (player_address, player_name, score) 
VALUES ('test123', 'TestPlayer', 100);

-- Lihat data
SELECT * FROM player_names;
SELECT * FROM high_scores;
```

## 🔍 Troubleshooting

### **Jika Script Error:**
1. **Check permissions** - pastikan Anda adalah owner project
2. **Run script satu per satu** jika ada error
3. **Check Supabase status** - pastikan project aktif

### **Jika Tabel Tidak Muncul:**
1. **Refresh halaman** Database → Tables
2. **Check schema** - pastikan di schema "public"
3. **Check permissions** - pastikan RLS policies dibuat

### **Jika Data Tidak Bisa Insert:**
1. **Check RLS policies** - pastikan policies dibuat dengan benar
2. **Check anon key** - pastikan anon key valid
3. **Check network** - pastikan koneksi internet stabil

## 📊 Expected Results

Setelah setup selesai:

1. **Database → Tables** menampilkan 2 tabel
2. **high_scores** dengan 6 columns
3. **player_names** dengan 5 columns
4. **RLS enabled** untuk kedua tabel
5. **Policies created** untuk public access

## 🎯 Next Steps

Setelah database schema dibuat:

1. **Update anon key** di `.env.local`
2. **Restart development server**
3. **Test game** dan lihat data masuk ke database
4. **Check leaderboard** menampilkan data dari Supabase

## 🆘 Support

Jika masih ada masalah:
1. **Check Supabase documentation**
2. **Verify project permissions**
3. **Check browser console** untuk error messages
4. **Use debug tool** di game untuk test koneksi

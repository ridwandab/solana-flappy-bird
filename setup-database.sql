-- Setup Database Schema untuk Solana Flappy Bird
-- Jalankan script ini di SQL Editor di Supabase Dashboard

-- Buat tabel high_scores
CREATE TABLE IF NOT EXISTS high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_high_scores_player_address ON high_scores(player_address);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_high_scores_timestamp ON high_scores(timestamp DESC);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public read access" ON high_scores;
DROP POLICY IF EXISTS "Allow public insert" ON high_scores;

-- Policy untuk public read (semua orang bisa baca)
CREATE POLICY "Allow public read access" ON high_scores
  FOR SELECT USING (true);

-- Policy untuk public insert (semua orang bisa insert)
CREATE POLICY "Allow public insert" ON high_scores
  FOR INSERT WITH CHECK (true);

-- Test insert data
INSERT INTO high_scores (player_address, player_name, score) 
VALUES ('test-wallet-address', 'Test Player', 100);

-- Cek data
SELECT * FROM high_scores ORDER BY score DESC LIMIT 5;

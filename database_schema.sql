-- =============================================
-- Solana Flappy Bird Database Schema
-- =============================================
-- Copy dan paste script ini ke Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/sql

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

-- =============================================
-- Test Data (Opsional - untuk testing)
-- =============================================
-- Uncomment baris di bawah untuk test insert data

-- INSERT INTO player_names (player_address, player_name) 
-- VALUES ('test123', 'TestPlayer');

-- INSERT INTO high_scores (player_address, player_name, score) 
-- VALUES ('test123', 'TestPlayer', 100);

-- SELECT * FROM player_names;
-- SELECT * FROM high_scores;

# Setup Supabase untuk Solana Flappy Bird

## Langkah 1: Buat Project Supabase Baru

1. **Buka https://supabase.com**
2. **Klik "Start your project"**
3. **Sign up/Login** dengan GitHub
4. **Klik "New Project"**
5. **Isi form:**
   - **Name:** `solana-flappy-bird`
   - **Database Password:** Buat password yang kuat
   - **Region:** Pilih yang terdekat (Singapore atau Tokyo)
6. **Klik "Create new project"**

## Langkah 2: Setup Database Schema

Setelah project dibuat, buka **SQL Editor** dan jalankan script berikut:

```sql
-- Buat tabel high_scores
CREATE TABLE high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat index untuk performa
CREATE INDEX idx_high_scores_player_address ON high_scores(player_address);
CREATE INDEX idx_high_scores_score ON high_scores(score DESC);
CREATE INDEX idx_high_scores_timestamp ON high_scores(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Policy untuk public read
CREATE POLICY "Allow public read access" ON high_scores
  FOR SELECT USING (true);

-- Policy untuk public insert
CREATE POLICY "Allow public insert" ON high_scores
  FOR INSERT WITH CHECK (true);
```

## Langkah 3: Dapatkan API Keys

1. **Buka Settings > API**
2. **Copy URL** (Project URL)
3. **Copy anon public key** (API Key)

## Langkah 4: Update Environment Variables

Update file `.env.local` dengan data yang benar:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Langkah 5: Deploy ke Vercel

```bash
# Add environment variables to Vercel
echo "https://your-project-id.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "your-anon-key-here" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy
vercel --prod
```

## Langkah 6: Test

1. **Main game** dan dapatkan score
2. **Buka leaderboard** - seharusnya menampilkan data dari Supabase
3. **Cek Supabase dashboard** - data seharusnya muncul di tabel `high_scores`

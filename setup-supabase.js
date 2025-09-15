#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Script untuk setup Supabase
console.log('🚀 Setup Supabase untuk Solana Flappy Bird')
console.log('')

console.log('📋 Langkah-langkah:')
console.log('1. Buka https://supabase.com')
console.log('2. Buat project baru dengan nama "solana-flappy-bird"')
console.log('3. Copy Project URL dan API Key')
console.log('4. Jalankan script ini dengan URL dan Key yang benar')
console.log('')

// Contoh penggunaan:
// node setup-supabase.js https://your-project.supabase.co your-anon-key

const supabaseUrl = process.argv[2]
const supabaseKey = process.argv[3]

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Usage: node setup-supabase.js <SUPABASE_URL> <SUPABASE_KEY>')
  console.log('')
  console.log('Contoh:')
  console.log('node setup-supabase.js https://your-project.supabase.co your-anon-key')
  process.exit(1)
}

async function setupSupabase() {
  try {
    console.log('🔗 Connecting to Supabase...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 Creating high_scores table...')
    
    // Create table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS high_scores (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          player_address TEXT NOT NULL,
          player_name TEXT NOT NULL DEFAULT 'Anonymous',
          score INTEGER NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_high_scores_player_address ON high_scores(player_address);
        CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(score DESC);
        CREATE INDEX IF NOT EXISTS idx_high_scores_timestamp ON high_scores(timestamp DESC);
        
        ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access" ON high_scores;
        CREATE POLICY "Allow public read access" ON high_scores
          FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Allow public insert" ON high_scores;
        CREATE POLICY "Allow public insert" ON high_scores
          FOR INSERT WITH CHECK (true);
      `
    })
    
    if (error) {
      console.log('❌ Error:', error.message)
      return
    }
    
    console.log('✅ Database setup completed!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Update .env.local with your Supabase credentials')
    console.log('2. Run: vercel env add NEXT_PUBLIC_SUPABASE_URL production')
    console.log('3. Run: vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production')
    console.log('4. Run: vercel --prod')
    console.log('')
    console.log('🎮 Your game is ready to use Supabase!')
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message)
  }
}

setupSupabase()

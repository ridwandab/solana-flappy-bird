#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Test koneksi Supabase dengan URL dan Key yang sudah ada
const supabaseUrl = 'https://yqxafphtxatnrxswnpje.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeGFmcGh0eGF0bnJ4c3ducGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDgzOTAsImV4cCI6MjA3MzQ4NDM5MH0.kPOwCHPczgR60hpfAwZgQ8zeybv1e3glhUEmcCglmRE'

console.log('🔗 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')
console.log('')

async function testConnection() {
  try {
    console.log('🔗 Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 Testing database connection...')
    
    // Test 1: Cek apakah tabel high_scores ada
    console.log('Test 1: Checking if high_scores table exists...')
    const { data: tableData, error: tableError } = await supabase
      .from('high_scores')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.log('❌ Table test failed:', tableError.message)
      console.log('💡 The high_scores table might not exist')
      console.log('')
      
      // Test 2: Cek apakah project aktif
      console.log('Test 2: Checking if project is active...')
      try {
        const response = await fetch(supabaseUrl + '/rest/v1/', {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        })
        
        if (response.ok) {
          console.log('✅ Project is active!')
          console.log('💡 You need to create the high_scores table')
          console.log('')
          console.log('📝 Run this SQL in Supabase SQL Editor:')
          console.log(`
CREATE TABLE high_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_address TEXT NOT NULL,
  player_name TEXT NOT NULL DEFAULT 'Anonymous',
  score INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_high_scores_player_address ON high_scores(player_address);
CREATE INDEX idx_high_scores_score ON high_scores(score DESC);

ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON high_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON high_scores
  FOR INSERT WITH CHECK (true);
          `)
        } else {
          console.log('❌ Project is not active:', response.status, response.statusText)
          console.log('💡 The project might be paused or deleted')
        }
      } catch (fetchError) {
        console.log('❌ Project connection failed:', fetchError.message)
        console.log('💡 The project URL might be invalid')
      }
      
      return
    }
    
    console.log('✅ Table test successful!')
    console.log('📊 Found', tableData.length, 'records in high_scores table')
    console.log('')
    
    // Test 3: Test insert
    console.log('Test 3: Testing insert...')
    const { data: insertData, error: insertError } = await supabase
      .from('high_scores')
      .insert([
        {
          player_address: 'test-wallet-' + Date.now(),
          player_name: 'Test Player',
          score: Math.floor(Math.random() * 100)
        }
      ])
      .select()
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message)
      console.log('💡 Check RLS policies')
      return
    }
    
    console.log('✅ Insert test successful!')
    console.log('📊 Inserted record:', insertData[0])
    console.log('')
    console.log('🎉 Supabase is working correctly!')
    console.log('')
    console.log('📝 Your game should now connect to Supabase!')
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
    console.log('💡 Possible issues:')
    console.log('1. Project is paused or deleted')
    console.log('2. URL is invalid')
    console.log('3. Network connection issue')
  }
}

testConnection()

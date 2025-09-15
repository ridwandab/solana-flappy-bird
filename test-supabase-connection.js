#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Test koneksi ke Supabase
console.log('🔗 Testing Supabase Connection...')
console.log('')

// Ganti dengan URL dan Key yang benar dari Supabase dashboard Anda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here'

if (supabaseUrl === 'https://your-project-ref.supabase.co' || supabaseKey === 'your-anon-key-here') {
  console.log('❌ Please update the URL and Key in this script first!')
  console.log('')
  console.log('1. Get URL and Key from Supabase Dashboard > Settings > API')
  console.log('2. Update the variables in this script')
  console.log('3. Run: node test-supabase-connection.js')
  process.exit(1)
}

async function testConnection() {
  try {
    console.log('🔗 Connecting to Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey.substring(0, 20) + '...')
    console.log('')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 Testing database connection...')
    
    // Test query
    const { data, error } = await supabase
      .from('high_scores')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Database connection failed:', error.message)
      console.log('')
      console.log('💡 Possible solutions:')
      console.log('1. Make sure the high_scores table exists')
      console.log('2. Run the setup-database.sql script in Supabase SQL Editor')
      console.log('3. Check if RLS policies are correct')
      return
    }
    
    console.log('✅ Database connection successful!')
    console.log('📊 Found', data.length, 'records in high_scores table')
    console.log('')
    
    // Test insert
    console.log('📝 Testing insert...')
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
      return
    }
    
    console.log('✅ Insert test successful!')
    console.log('📊 Inserted record:', insertData[0])
    console.log('')
    console.log('🎉 Supabase is working correctly!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Add environment variables to Vercel:')
    console.log(`   echo "${supabaseUrl}" | vercel env add NEXT_PUBLIC_SUPABASE_URL production`)
    console.log(`   echo "${supabaseKey}" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`)
    console.log('2. Deploy: vercel --prod')
    console.log('3. Test the game!')
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
  }
}

testConnection()

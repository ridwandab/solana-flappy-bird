'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase, isSupabaseAvailable, saveHighScore, savePlayerName } from '@/lib/supabase'

export const SupabaseDebug: React.FC = () => {
  const { publicKey } = useWallet()
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setIsLoading(true)
    setTestResult('')

    try {
      // Test 1: Check if Supabase is available
      const available = isSupabaseAvailable()
      setTestResult(prev => prev + `1. Supabase Available: ${available}\n`)

      if (!available) {
        setTestResult(prev => prev + '❌ Supabase not available. Check .env.local file.\n')
        return
      }

      // Test 2: Test database connection
      const { data, error } = await supabase!
        .from('high_scores')
        .select('count')
        .limit(1)

      if (error) {
        setTestResult(prev => prev + `❌ Database connection error: ${error.message}\n`)
      } else {
        setTestResult(prev => prev + '✅ Database connection successful\n')
      }

      // Test 3: Test insert (if wallet connected)
      if (publicKey) {
        const testPlayerName = 'TestPlayer'
        const testScore = 999

        // Test save player name
        try {
          await savePlayerName(publicKey.toString(), testPlayerName)
          setTestResult(prev => prev + '✅ Player name save test successful\n')
        } catch (error) {
          setTestResult(prev => prev + `❌ Player name save error: ${error}\n`)
        }

        // Test save high score
        try {
          await saveHighScore(publicKey.toString(), testPlayerName, testScore)
          setTestResult(prev => prev + '✅ High score save test successful\n')
        } catch (error) {
          setTestResult(prev => prev + `❌ High score save error: ${error}\n`)
        }
      } else {
        setTestResult(prev => prev + '⚠️ Wallet not connected - skipping insert tests\n')
      }

    } catch (error) {
      setTestResult(prev => prev + `❌ Test failed: ${error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-white font-bold mb-4">🔧 Supabase Debug Tool</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-white/80 text-sm mb-2">
            Test Supabase connection and data saving
          </p>
          <button
            onClick={testSupabaseConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Supabase'}
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2">Test Results:</h4>
            <pre className="text-white/80 text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2">Environment Info:</h4>
          <div className="text-white/80 text-sm space-y-1">
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
            <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_supabase_anon_key') ? 
                '❌ Placeholder (not configured)' : 
                '✅ Set correctly') : 
              '❌ Not set'}</p>
            <p>Wallet: {publicKey ? 'Connected' : 'Not connected'}</p>
            <p>Key Length: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0} characters</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white font-semibold mb-2">Setup Instructions:</h4>
          <div className="text-white/80 text-sm space-y-2">
            <p><strong>Step 1:</strong> Create database tables</p>
            <p>• Go to: <a href="https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/sql" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">SQL Editor</a></p>
            <p>• Copy script from: <code className="bg-gray-700 px-1 rounded">database_schema.sql</code></p>
            <p>• Click "Run" to create tables</p>
            <p><strong>Step 2:</strong> Get anon key</p>
            <p>• Go to: <a href="https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Settings → API</a></p>
            <p>• Copy "anon public" key</p>
            <p>• Update <code className="bg-gray-700 px-1 rounded">.env.local</code> file</p>
            <p>• Restart development server</p>
          </div>
        </div>
      </div>
    </div>
  )
}

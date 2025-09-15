import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase, isSupabaseAvailable } from '@/lib/supabase'

export const useHighScore = () => {
  const { publicKey } = useWallet()
  const [highScore, setHighScore] = useState<number>(0)

  useEffect(() => {
    if (publicKey) {
      loadHighScore()
    }
  }, [publicKey])

  const loadHighScore = async () => {
    if (!publicKey) return

    try {
      // Try to load from Supabase first if available
      if (isSupabaseAvailable()) {
        const { data, error } = await supabase!
          .from('high_scores')
          .select('score')
          .eq('player_address', publicKey.toString())
          .order('score', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Supabase error:', error)
          // Fallback to localStorage
          const saved = localStorage.getItem(`highScore_${publicKey.toString()}`)
          if (saved) {
            setHighScore(parseInt(saved))
          }
        } else if (data) {
          setHighScore(data.score)
        } else {
          // No data found, check localStorage
          const saved = localStorage.getItem(`highScore_${publicKey.toString()}`)
          if (saved) {
            setHighScore(parseInt(saved))
          }
        }
      } else {
        // Supabase not available, load from localStorage
        console.log('Supabase not configured, loading from localStorage')
        const saved = localStorage.getItem(`highScore_${publicKey.toString()}`)
        if (saved) {
          setHighScore(parseInt(saved))
        }
      }
    } catch (error) {
      console.error('Failed to load high score:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem(`highScore_${publicKey.toString()}`)
      if (saved) {
        setHighScore(parseInt(saved))
      }
    }
  }

  const saveHighScore = async (playerAddress: string, playerName: string, score: number) => {
    try {
      // Get current high score first
      const currentHighScore = await getHighScore(playerAddress)
      
      // Only update high score if new score is higher
      if (score > currentHighScore) {
        // Always save to localStorage as backup
        localStorage.setItem(`highScore_${playerAddress}`, score.toString())
        
        // Try to save to Supabase if available
        if (isSupabaseAvailable()) {
          const { data, error } = await supabase!
            .from('high_scores')
            .insert([
              {
                player_address: playerAddress,
                player_name: playerName,
                score: score,
                timestamp: new Date().toISOString(),
              }
            ])
            .select()

          if (error) {
            console.error('Failed to save to Supabase:', error)
          } else {
            console.log('High score saved to Supabase:', data)
          }
        } else {
          console.log('Supabase not configured, saved to localStorage only')
        }
        
        if (publicKey && playerAddress === publicKey.toString()) {
          setHighScore(score)
        }
        
        console.log(`New high score ${score} saved for ${playerName} (${playerAddress})! (Previous: ${currentHighScore})`)
      } else {
        console.log(`Score ${score} not saved as high score for ${playerName} (${playerAddress}) (Current high: ${currentHighScore})`)
      }

      // Always save to leaderboard (for tracking all scores)
      const leaderboardKey = `leaderboard_${playerAddress}_${Date.now()}`
      const leaderboardEntry = {
        id: leaderboardKey,
        player_address: playerAddress,
        player_name: playerName,
        score,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboardEntry))
      
      console.log(`Score ${score} added to leaderboard for ${playerName} (${playerAddress})`)
    } catch (error) {
      console.error('Failed to save high score:', error)
    }
  }

  const getHighScore = async (playerAddress: string): Promise<number> => {
    try {
      // Try to get from Supabase first if available
      if (isSupabaseAvailable()) {
        const { data, error } = await supabase!
          .from('high_scores')
          .select('score')
          .eq('player_address', playerAddress)
          .order('score', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Supabase error:', error)
          // Fallback to localStorage
          const saved = localStorage.getItem(`highScore_${playerAddress}`)
          return saved ? parseInt(saved) : 0
        } else if (data) {
          return data.score
        } else {
          // No data found, check localStorage
          const saved = localStorage.getItem(`highScore_${playerAddress}`)
          return saved ? parseInt(saved) : 0
        }
      } else {
        // Supabase not available, get from localStorage
        const saved = localStorage.getItem(`highScore_${playerAddress}`)
        return saved ? parseInt(saved) : 0
      }
    } catch (error) {
      console.error('Failed to get high score:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem(`highScore_${playerAddress}`)
      return saved ? parseInt(saved) : 0
    }
  }

  return {
    highScore,
    saveHighScore,
    getHighScore,
  }
}

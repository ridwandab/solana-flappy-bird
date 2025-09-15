import { useState, useEffect } from 'react'
import { supabase, getHighScores, isSupabaseAvailable } from '@/lib/supabase'

interface LeaderboardEntry {
  id: string
  player_address: string
  player_name: string
  score: number
  timestamp: string
  created_at: string
}

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard('all')
  }, [])

  const loadLeaderboard = async (timeFilter: 'all' | 'daily' | 'weekly' | 'monthly' = 'all') => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if Supabase is available
      if (!isSupabaseAvailable()) {
        console.log('Supabase not configured, loading from localStorage')
        await loadFromLocalStorage(timeFilter)
        return
      }

      let query = supabase!
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(100)

      // Apply time filtering
      const now = new Date()
      let startDate: Date

      switch (timeFilter) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'weekly':
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startDate = new Date(now)
          startDate.setDate(now.getDate() - daysToMonday)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0) // All time
      }

      if (timeFilter !== 'all') {
        query = query.gte('timestamp', startDate.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        // Fallback to localStorage if Supabase fails
        await loadFromLocalStorage(timeFilter)
        return
      }

      setLeaderboard(data || [])
      console.log(`Loaded ${data?.length || 0} leaderboard entries for ${timeFilter}`)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      setError('Failed to load leaderboard')
      // Fallback to localStorage
      await loadFromLocalStorage(timeFilter)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromLocalStorage = async (timeFilter: 'all' | 'daily' | 'weekly' | 'monthly' = 'all') => {
    try {
      const allScores: LeaderboardEntry[] = []
      
      // Get all leaderboard entries from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('leaderboard_')) {
          try {
            const entryData = localStorage.getItem(key)
            if (entryData) {
              const entry = JSON.parse(entryData) as LeaderboardEntry
              if (entry.score > 0) {
                allScores.push(entry)
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse leaderboard entry:', key, parseError)
          }
        }
      }

      // Apply time filtering to localStorage data
      const filteredScores = allScores.filter(entry => {
        if (timeFilter === 'all') return true
        
        const entryDate = new Date(entry.timestamp)
        const now = new Date()
        let startDate: Date

        switch (timeFilter) {
          case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'weekly':
            const dayOfWeek = now.getDay()
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            startDate = new Date(now)
            startDate.setDate(now.getDate() - daysToMonday)
            startDate.setHours(0, 0, 0, 0)
            break
          case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          default:
            return true
        }

        return entryDate >= startDate
      })

      // Sort by score (highest first)
      const sortedScores = filteredScores.sort((a, b) => b.score - a.score)
      
      // Take top 100 scores
      setLeaderboard(sortedScores.slice(0, 100))
      
      console.log(`Loaded ${sortedScores.length} leaderboard entries from localStorage for ${timeFilter}`)
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      setError('Failed to load leaderboard')
    }
  }

  const addScore = async (playerAddress: string, playerName: string, score: number) => {
    try {
      // Always save to localStorage as backup
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

      // Try to save to Supabase if available
      if (isSupabaseAvailable()) {
        const newEntry = {
          player_address: playerAddress,
          player_name: playerName,
          score: score,
          timestamp: new Date().toISOString(),
        }

        const { data, error } = await supabase!
          .from('high_scores')
          .insert([newEntry])
          .select()

        if (error) {
          console.error('Failed to save to Supabase:', error)
        } else {
          console.log('Score saved to Supabase:', data)
        }
      } else {
        console.log('Supabase not configured, saved to localStorage only')
      }

      // Refresh leaderboard
      await loadLeaderboard('all')
    } catch (error) {
      console.error('Failed to add score:', error)
    }
  }

  const getTopScores = (limit: number = 10): LeaderboardEntry[] => {
    return leaderboard.slice(0, limit)
  }

  const getPlayerRank = (playerAddress: string): number => {
    const index = leaderboard.findIndex(entry => entry.player_address === playerAddress)
    return index >= 0 ? index + 1 : -1
  }

  const refreshLeaderboard = (timeFilter: 'all' | 'daily' | 'weekly' | 'monthly' = 'all') => {
    loadLeaderboard(timeFilter)
  }

  return {
    leaderboard,
    isLoading,
    error,
    addScore,
    getTopScores,
    getPlayerRank,
    refreshLeaderboard,
    loadLeaderboard,
  }
}

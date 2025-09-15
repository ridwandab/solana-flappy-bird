'use client'

import { FC, useState, useEffect } from 'react'
import { Trophy, Medal, Award, Star, RefreshCw, ExternalLink } from 'lucide-react'
import { supabase, isSupabaseAvailable } from '@/lib/supabase'

interface HighScoreEntry {
  id: string
  player_name: string
  player_address: string
  score: number
  timestamp: string
  created_at: string
}

export const HighScoreDashboard: FC = () => {
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHighScores = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!isSupabaseAvailable()) {
        setError('Supabase not configured')
        return
      }

      const { data, error } = await supabase!
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (error) {
        setError(error.message)
        return
      }

      setHighScores(data || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch high scores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHighScores()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Star className="w-6 h-6 text-blue-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400'
      case 2:
        return 'text-gray-300'
      case 3:
        return 'text-amber-600'
      default:
        return 'text-white'
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">High Scores</h2>
            <p className="text-white/60 text-sm">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHighScores}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <a
            href="https://supabase.com/dashboard/project/yqxafphtxatnrxswnpje/database/tables"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-white/60 mt-4">Loading high scores...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load high scores</p>
          <p className="text-white/60 mt-2">{error}</p>
          <button
            onClick={fetchHighScores}
            className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : highScores.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No high scores yet. Be the first to play!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 py-3 border-b border-white/10 text-white/60 font-semibold text-sm">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-center">Score</div>
            <div className="col-span-2 text-center">Wallet</div>
            <div className="col-span-2 text-center">Date</div>
          </div>

          {/* High Score Entries */}
          {highScores.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg px-2"
            >
              <div className="col-span-1 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  {getRankIcon(index + 1)}
                  <span className={`font-bold ${getRankColor(index + 1)}`}>
                    #{index + 1}
                  </span>
                </div>
              </div>
              
              <div className="col-span-4 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {entry.player_name ? entry.player_name.slice(0, 2).toUpperCase() : '??'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {entry.player_name || 'Anonymous'}
                  </span>
                </div>
              </div>
              
              <div className="col-span-3 text-center">
                <span className="text-2xl font-bold text-white">{entry.score}</span>
              </div>
              
              <div className="col-span-2 text-center">
                <span className="text-white/80 text-sm">
                  {formatAddress(entry.player_address)}
                </span>
              </div>
              
              <div className="col-span-2 text-center">
                <span className="text-white/80 text-sm">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Showing top {highScores.length} scores</span>
          <span>Data from Supabase database</span>
        </div>
      </div>
    </div>
  )
}

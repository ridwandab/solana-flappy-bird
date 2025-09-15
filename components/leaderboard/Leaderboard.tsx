'use client'

import { FC, useState, useEffect } from 'react'
import { Trophy, Medal, Award, Star } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { formatAddress } from '@/lib/utils'

export const Leaderboard: FC = () => {
  const { leaderboard, isLoading, error, loadLeaderboard } = useLeaderboard()
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all')

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

  const handleTimeFilterChange = (filter: 'all' | 'daily' | 'weekly' | 'monthly') => {
    setTimeFilter(filter)
    loadLeaderboard(filter)
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatAddress = (address: string) => {
    if (!address) return 'Anonymous'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center space-x-3">
          <Trophy className="w-10 h-10 text-yellow-400" />
          <span>Leaderboard</span>
        </h1>
        <p className="text-white/60">
          Compete with players worldwide for the highest score
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-center space-x-2">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => handleTimeFilterChange(filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              timeFilter === filter
                ? 'bg-primary-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-white/60 mt-4">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">Failed to load leaderboard</p>
            <p className="text-white/60 mt-2">{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No scores yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-white/10 text-white/60 font-semibold">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-3 text-center">Score</div>
              <div className="col-span-2 text-center">Date</div>
              <div className="col-span-2 text-center">Time</div>
            </div>

            {/* Leaderboard Entries */}
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-4 py-4 border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg px-2"
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
                    {entry.player_name ? entry.player_name.slice(0, 2).toUpperCase() : (entry.player_address ? entry.player_address.slice(2, 4).toUpperCase() : '??')}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">
                      {entry.player_name || (entry.player_address ? formatAddress(entry.player_address) : 'Anonymous')}
                    </span>
                    {entry.player_name && (
                      <span className="text-xs text-white/50">
                        {formatAddress(entry.player_address)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="col-span-3 text-center">
                  <span className="text-2xl font-bold text-white">{entry.score}</span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-white/80">{formatDate(entry.timestamp)}</span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className="text-white/80">{formatTime(entry.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button removed */}
    </div>
  )
}

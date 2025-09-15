'use client'

import { useState, useEffect } from 'react'
import { User, Save, X } from 'lucide-react'
import { savePlayerName, getPlayerName } from '@/lib/supabase'

interface PlayerNameModalProps {
  isOpen: boolean
  playerAddress: string
  onClose: () => void
  onSave: (playerName: string) => void
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  isOpen,
  playerAddress,
  onClose,
  onSave,
}) => {
  const [playerName, setPlayerName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && playerAddress) {
      loadExistingName()
    }
  }, [isOpen, playerAddress])

  const loadExistingName = async () => {
    try {
      const existingName = await getPlayerName(playerAddress)
      if (existingName) {
        setPlayerName(existingName)
      }
    } catch (error) {
      console.error('Failed to load existing name:', error)
    }
  }

  const handleSave = async () => {
    if (!playerName.trim()) {
      setError('Please enter a player name')
      return
    }

    if (playerName.length < 2) {
      setError('Player name must be at least 2 characters')
      return
    }

    if (playerName.length > 20) {
      setError('Player name must be less than 20 characters')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Save to Supabase
      await savePlayerName(playerAddress, playerName.trim())
      
      // Save to localStorage as backup
      localStorage.setItem(`playerName_${playerAddress}`, playerName.trim())
      
      onSave(playerName.trim())
      onClose()
    } catch (error) {
      console.error('Failed to save player name:', error)
      setError('Failed to save player name. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-white">Player Name</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-white/80 text-sm">
            Enter your player name to appear on the leaderboard. This name will be associated with your wallet address.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={20}
              autoFocus
            />
            <p className="text-xs text-gray-400">
              {playerName.length}/20 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Wallet Address Display */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
            <p className="text-white font-mono text-sm">
              {playerAddress.slice(0, 8)}...{playerAddress.slice(-8)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !playerName.trim()}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

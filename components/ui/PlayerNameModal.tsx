'use client'

import { FC, useState } from 'react'
import { X, User, Save } from 'lucide-react'

interface PlayerNameModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (playerName: string) => void
  currentPlayerName?: string
}

export const PlayerNameModal: FC<PlayerNameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPlayerName = ''
}) => {
  const [playerName, setPlayerName] = useState(currentPlayerName)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!playerName.trim()) {
      alert('Please enter a player name')
      return
    }

    if (playerName.length > 20) {
      alert('Player name must be 20 characters or less')
      return
    }

    setIsLoading(true)
    try {
      await onSave(playerName.trim())
      // Show success message
      alert('Player name saved successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving player name:', error)
      alert('Failed to save player name. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Player Name</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter your player name to save your high scores and compete on the leaderboard!
          </p>
          
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Player Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name..."
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              {playerName.length}/20 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !playerName.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

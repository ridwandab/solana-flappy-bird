'use client'

import { FC, useState, useEffect } from 'react'
import { X, User, Play } from 'lucide-react'

interface PlayerNameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (playerName: string) => void
  defaultName?: string
}

export const PlayerNameModal: FC<PlayerNameModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultName = ''
}) => {
  const [playerName, setPlayerName] = useState(defaultName)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPlayerName(defaultName)
    }
  }, [isOpen, defaultName])

  useEffect(() => {
    setIsValid(playerName.trim().length >= 2 && playerName.trim().length <= 20)
  }, [playerName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onConfirm(playerName.trim())
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit(e)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Enter Your Name</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-white/80 text-sm font-medium mb-2">
              Player Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name (2-20 characters)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              autoFocus
              maxLength={20}
            />
            <p className="text-white/60 text-xs mt-2">
              {playerName.length}/20 characters
            </p>
          </div>

          {/* Validation Message */}
          {playerName.length > 0 && !isValid && (
            <div className="text-red-400 text-sm">
              Name must be between 2-20 characters
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Game
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <p className="text-white/60 text-sm text-center">
            Your name will be displayed on the leaderboard and saved with your high scores.
          </p>
        </div>
      </div>
    </div>
  )
}

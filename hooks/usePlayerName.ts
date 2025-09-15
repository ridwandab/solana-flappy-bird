'use client'

import { useState, useEffect } from 'react'

const PLAYER_NAME_KEY = 'flappyBirdPlayerName'

export const usePlayerName = () => {
  const [playerName, setPlayerName] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load player name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY)
    if (savedName) {
      setPlayerName(savedName)
    }
    setIsLoaded(true)
  }, [])

  // Save player name to localStorage
  const savePlayerName = (name: string) => {
    const trimmedName = name.trim()
    if (trimmedName.length >= 2 && trimmedName.length <= 20) {
      setPlayerName(trimmedName)
      localStorage.setItem(PLAYER_NAME_KEY, trimmedName)
      return true
    }
    return false
  }

  // Clear player name
  const clearPlayerName = () => {
    setPlayerName('')
    localStorage.removeItem(PLAYER_NAME_KEY)
  }

  // Get display name (fallback to 'Anonymous' if empty)
  const getDisplayName = () => {
    return playerName || 'Anonymous'
  }

  return {
    playerName,
    isLoaded,
    savePlayerName,
    clearPlayerName,
    getDisplayName
  }
}

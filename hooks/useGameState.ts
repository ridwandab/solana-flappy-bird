import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface GameState {
  highScore: number
  totalGames: number
  totalScore: number
  selectedCosmetic: string | null
  soundEnabled: boolean
  musicEnabled: boolean
}

export const useGameState = () => {
  const { publicKey } = useWallet()
  const [gameState, setGameState] = useState<GameState>({
    highScore: 0,
    totalGames: 0,
    totalScore: 0,
    selectedCosmetic: null,
    soundEnabled: true,
    musicEnabled: true,
  })

  useEffect(() => {
    if (publicKey) {
      loadGameState()
    } else {
      // Load anonymous game state
      loadAnonymousGameState()
    }
  }, [publicKey])

  const loadGameState = async () => {
    if (!publicKey) return

    try {
      // Load from localStorage for now (can be replaced with Supabase)
      const saved = localStorage.getItem(`gameState_${publicKey.toString()}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setGameState(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
    }
  }

  const loadAnonymousGameState = async () => {
    try {
      // Load anonymous high score from localStorage
      const highScoreKey = `highScore_anonymous`
      const savedHighScore = localStorage.getItem(highScoreKey)
      if (savedHighScore) {
        const highScore = parseInt(savedHighScore)
        if (highScore > 0) {
          console.log(`Loaded anonymous high score: ${highScore}`)
          setGameState(prev => ({ ...prev, highScore }))
        }
      }
    } catch (error) {
      console.error('Failed to load anonymous game state:', error)
    }
  }

  const updateGameState = async (updates: Partial<GameState>) => {
    if (!publicKey) return

    try {
      const newState = { ...gameState, ...updates }
      setGameState(newState)
      
      // Save to localStorage (can be replaced with Supabase)
      localStorage.setItem(`gameState_${publicKey.toString()}`, JSON.stringify(newState))
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }

  const updateHighScore = async (newScore: number) => {
    // Only update high score if new score is higher
    if (newScore > gameState.highScore) {
      console.log(`New high score achieved: ${newScore} (Previous: ${gameState.highScore})`)
      await updateGameState({ 
        highScore: newScore,
        totalGames: gameState.totalGames + 1,
        totalScore: gameState.totalScore + newScore,
      })
    } else {
      console.log(`Score ${newScore} not a new high score (Current high: ${gameState.highScore})`)
      await updateGameState({
        totalGames: gameState.totalGames + 1,
        totalScore: gameState.totalScore + newScore,
      })
    }
  }

  const updateSelectedCosmetic = async (cosmeticId: string | null) => {
    await updateGameState({ selectedCosmetic: cosmeticId })
  }

  const resetGameState = async () => {
    if (!publicKey) return

    const resetState: GameState = {
      highScore: 0,
      totalGames: 0,
      totalScore: 0,
      selectedCosmetic: null,
      soundEnabled: true,
      musicEnabled: true,
    }

    setGameState(resetState)
    localStorage.setItem(`gameState_${publicKey.toString()}`, JSON.stringify(resetState))
  }

  return {
    gameState,
    updateGameState,
    updateHighScore,
    updateSelectedCosmetic,
    resetGameState,
  }
}

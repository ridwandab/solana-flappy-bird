'use client'

import { FC, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Game } from './Game'
import { usePlayerName } from '@/hooks/usePlayerName'
import { useHighScore } from '@/hooks/useHighScore'
import { useLeaderboard } from '@/hooks/useLeaderboard'

interface GameWithPlayerNameProps {
  onBackToMenu?: () => void
}

export const GameWithPlayerName: FC<GameWithPlayerNameProps> = ({ onBackToMenu }) => {
  const { publicKey } = useWallet()
  const { playerName } = usePlayerName()
  const { saveHighScore } = useHighScore()
  const { addScore } = useLeaderboard()
  
  const [gameScore, setGameScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)

  const handleGameOver = async (score: number) => {
    if (!publicKey) return

    setGameScore(score)
    setIsGameOver(true)

    // Get player name (use saved name or fallback to address)
    const displayName = playerName || `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`

    try {
      console.log(`🎮 Game over! Score: ${score}, Player: ${displayName}, Address: ${publicKey.toString()}`)
      
      // Save high score
      await saveHighScore(publicKey.toString(), displayName, score)
      
      // Add to leaderboard
      await addScore(publicKey.toString(), displayName, score)
      
      console.log(`✅ Score saved successfully!`)
    } catch (error) {
      console.error('❌ Failed to save score:', error)
    }
  }

  const handleGameRestart = () => {
    setGameScore(0)
    setIsGameOver(false)
  }

  return (
    <Game 
      onBackToMenu={onBackToMenu}
      onGameOver={handleGameOver}
      onGameRestart={handleGameRestart}
    />
  )
}

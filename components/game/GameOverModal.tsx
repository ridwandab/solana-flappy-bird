'use client'

import { Trophy, RotateCcw, Home } from 'lucide-react'

interface GameOverModalProps {
  score: number
  highScore: number
  onRestart: () => void
  onBackToMenu: () => void
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  onRestart,
  onBackToMenu,
}) => {
  // This modal is now handled by Phaser GameScene
  // We keep this component for compatibility but it renders nothing
  return null
}

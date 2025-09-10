'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { GameScene } from './GameScene'
import { useSettings } from '@/hooks/useSettings'

export const Game: FC = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const { settings, getGamePhysicsConfig, getAudioConfig, getGraphicsConfig } = useSettings()
  const [currentScore, setCurrentScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: getGamePhysicsConfig().gravity, x: 0 },
          debug: false
        }
      },
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    phaserGameRef.current = new Phaser.Game(config)

    // Listen for score updates from the game
    const handleScoreUpdate = (score: number) => {
      setCurrentScore(score)
      if (score > highScore) {
        setHighScore(score)
      }
    }

    // Listen for game over events
    const handleGameOver = (score: number) => {
      if (score > highScore) {
        setHighScore(score)
      }
    }

    // Add event listeners
    phaserGameRef.current.events.on('scoreUpdate', handleScoreUpdate)
    phaserGameRef.current.events.on('gameOver', handleGameOver)

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.events.off('scoreUpdate', handleScoreUpdate)
        phaserGameRef.current.events.off('gameOver', handleGameOver)
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Score Display */}
      <div className="mb-4 flex space-x-8 text-white">
        <div className="text-center">
          <div className="text-lg font-semibold">Score</div>
          <div className="text-2xl font-bold text-yellow-400">{currentScore}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">High Score</div>
          <div className="text-2xl font-bold text-green-400">{highScore}</div>
        </div>
      </div>
      
      {/* Game Container */}
      <div 
        ref={gameRef} 
        className="border-4 border-purple-500 rounded-lg shadow-2xl"
        style={{ width: '800px', height: '600px' }}
      />
    </div>
  )
}

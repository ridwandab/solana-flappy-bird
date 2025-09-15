'use client'

import { FC, useEffect, useRef } from 'react'
import { GameScene } from './GameScene'
import { useSettings } from '@/hooks/useSettings'

interface GameProps {
  onBackToMenu?: () => void
  onGameOver?: (score: number) => void
  onGameRestart?: () => void
}

export const Game: FC<GameProps> = ({ onBackToMenu, onGameOver, onGameRestart }) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const { settings, getGamePhysicsConfig, getAudioConfig, getGraphicsConfig } = useSettings()

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 780,
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

    // Add event listeners
    if (phaserGameRef.current) {
      phaserGameRef.current.events.on('goToMainMenu', () => {
        console.log('Main Menu button clicked - going back to menu')
        if (onBackToMenu) {
          onBackToMenu()
        }
      })

      phaserGameRef.current.events.on('gameOver', (score: number) => {
        console.log('Game over event received with score:', score)
        if (onGameOver) {
          onGameOver(score)
        }
      })

      phaserGameRef.current.events.on('gameRestart', () => {
        console.log('Game restart event received')
        if (onGameRestart) {
          onGameRestart()
        }
      })
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [onBackToMenu])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Game Container - centered with better spacing */}
      <div 
        ref={gameRef} 
        className="shadow-2xl"
        style={{ width: '800px', height: '780px' }}
      />
    </div>
  )
}

'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { GameScene } from './GameScene'
import { GameOverModal } from './GameOverModal'
import { PauseModal } from './PauseModal'

interface GameProps {
  onBackToMenu?: () => void
}

const Game: FC<GameProps> = ({ onBackToMenu }) => {
  const { publicKey } = useWallet()
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Initialize game
  useEffect(() => {
    if (!gameRef.current || gameInstance) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 30, x: 0 },
          debug: false
        }
      },
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }

    const game = new Phaser.Game(config)
    setGameInstance(game)

    // Game event listeners
    game.events.on('scoreUpdate', (newScore: number) => {
      setScore(newScore)
    })

    game.events.on('gameOver', (finalScore: number) => {
      setIsGameOver(true)
      
      if (finalScore > highScore) {
        setHighScore(finalScore)
      }
    })

    game.events.on('pause', () => {
      setIsPaused(true)
    })

    game.events.on('resume', () => {
      setIsPaused(false)
    })

    game.events.on('backToMenu', () => {
      if (onBackToMenu) {
        onBackToMenu()
      }
    })

    return () => {
      game.destroy(true)
      setGameInstance(null)
    }
  }, [gameRef.current, onBackToMenu, highScore])

  const handleRestart = () => {
    if (gameInstance) {
      gameInstance.scene.start('GameScene')
      setIsGameOver(false)
      setIsPaused(false)
      setScore(0)
    }
  }

  const handlePause = () => {
    if (gameInstance && !isGameOver) {
      if (isPaused) {
        gameInstance.scene.resume('GameScene')
      } else {
        gameInstance.scene.pause('GameScene')
      }
    }
  }

  const handleResume = () => {
    if (gameInstance) {
      gameInstance.scene.resume('GameScene')
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-center w-full max-w-4xl">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-white/80">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/80">High Score</p>
            <p className="text-xl font-bold text-yellow-400">
              {highScore}
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={gameRef}
        className="border-4 border-white/20 rounded-lg shadow-2xl"
        style={{ width: '800px', height: '600px' }}
      />

      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu || (() => {})}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onBackToMenu={onBackToMenu || (() => {})}
        />
      )}
    </div>
  )
}

export default Game
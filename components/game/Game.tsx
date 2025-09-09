'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { GameScene } from './GameScene'
import { GameOverModal } from './GameOverModal'
import { PauseModal } from './PauseModal'
import { useGameState } from '@/hooks/useGameState'
import { useHighScore } from '@/hooks/useHighScore'
import { useQuestIntegration } from '@/hooks/useQuestIntegration'
import { useSettings } from '@/hooks/useSettings'

interface GameProps {
  onBackToMenu: () => void
}

export const Game: FC<GameProps> = ({ onBackToMenu }) => {
  const { publicKey } = useWallet()
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const { gameState, updateHighScore } = useGameState()
  const { saveHighScore, getHighScore } = useHighScore()
  const { quests, acceptQuest } = useQuestIntegration(phaserGameRef.current)
  const { settings, getGamePhysicsConfig, getAudioConfig, getGraphicsConfig } = useSettings()
  
  // Debug quest integration
  useEffect(() => {
    console.log('🔍 Quest integration debug - game instance:', phaserGameRef.current)
    console.log('🔍 Quest integration debug - quests:', quests)
  }, [phaserGameRef.current, quests])

  // Load current high score when component mounts or publicKey changes
  useEffect(() => {
    const loadCurrentHighScore = async () => {
      if (publicKey) {
        const currentHigh = await getHighScore(publicKey.toString())
        console.log(`Loaded current high score: ${currentHigh}`)
      } else {
        const currentHigh = await getHighScore('anonymous')
        console.log(`Loaded current anonymous high score: ${currentHigh}`)
      }
    }
    
    loadCurrentHighScore()
  }, [publicKey, getHighScore])

  useEffect(() => {
    if (!gameRef.current) return

    const physicsConfig = getGamePhysicsConfig()
    const graphicsConfig = getGraphicsConfig()

    // Get screen dimensions
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const isMobile = screenWidth < 768
    const isLandscape = screenWidth > screenHeight

    // Calculate game dimensions based on device and orientation
    let gameWidth = 800
    let gameHeight = 600

    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile - use full width, maintain aspect ratio
        gameWidth = Math.min(screenWidth, 1200)
        gameHeight = Math.round(gameWidth * 0.75) // 4:3 aspect ratio
      } else {
        // Portrait mobile - use full height, maintain aspect ratio
        gameHeight = Math.min(screenHeight * 0.8, 800) // 80% of screen height
        gameWidth = Math.round(gameHeight * 1.33) // 4:3 aspect ratio
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: gameWidth,
      height: gameHeight,
      parent: gameRef.current,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: physicsConfig.gravity },
          debug: graphicsConfig.showFPS,
        },
      },
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth,
        height: gameHeight,
      },
    }

    phaserGameRef.current = new Phaser.Game(config)
    
    // Pass settings to game scene
    const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene
    if (gameScene) {
      gameScene.setSettings(settings)
    }

    // Listen for game events
    const game = phaserGameRef.current
    game.events.on('score', (newScore: number) => {
      setScore(newScore)
    })

    game.events.on('gameOver', (finalScore: number) => {
      setIsGameOver(true)
      console.log('Game Over event received with score:', finalScore)
      
      // Save high score immediately and update game state
      if (publicKey) {
        console.log('Saving high score for wallet:', publicKey.toString())
        saveHighScore(publicKey.toString(), finalScore)
        updateHighScore(finalScore)
      } else {
        console.log('No wallet connected, saving as anonymous')
        saveHighScore('anonymous', finalScore)
        updateHighScore(finalScore)
      }
    })

    game.events.on('pause', () => {
      setIsPaused(true)
    })

    game.events.on('restart', () => {
      setIsGameOver(false)
      console.log('Restart event received')
    })

    game.events.on('backToMenu', () => {
      console.log('Back to menu event received')
      onBackToMenu()
    })

    // Listen for quest events
    game.events.on('questEvent', (event: any) => {
      console.log('Quest event received in Game component:', event)
      // Quest events are handled by useQuestIntegration hook
    })

    // Handle window resize and orientation change
    const handleResize = () => {
      if (phaserGameRef.current) {
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const isMobile = screenWidth < 768
        const isLandscape = screenWidth > screenHeight

        let gameWidth = 800
        let gameHeight = 600

        if (isMobile) {
          if (isLandscape) {
            gameWidth = Math.min(screenWidth, 1200)
            gameHeight = Math.round(gameWidth * 0.75)
          } else {
            gameHeight = Math.min(screenHeight * 0.8, 800)
            gameWidth = Math.round(gameHeight * 1.33)
          }
        }

        phaserGameRef.current.scale.resize(gameWidth, gameHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, []) // Remove all dependencies to prevent game recreation

  // Update settings in game scene when settings change
  useEffect(() => {
    if (phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene
      if (gameScene) {
        console.log('Updating game scene with new settings:', settings)
        gameScene.setSettings(settings)
      }
    }
  }, [settings]) // Update when settings change

  const handleRestart = () => {
    setIsGameOver(false)
    setScore(0)
    if (phaserGameRef.current) {
      // Pass selected cosmetic to maintain appearance
      const selectedCosmetic = gameState.selectedCosmetic
      console.log(`Game State:`, gameState)
      console.log(`Selected Cosmetic:`, selectedCosmetic)
      console.log(`Restarting game with cosmetic: ${selectedCosmetic}`)
      phaserGameRef.current.scene.start('GameScene', { selectedCosmetic })
    }
  }

  const handleResume = () => {
    setIsPaused(false)
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.resume('GameScene')
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    if (phaserGameRef.current) {
      phaserGameRef.current.scene.pause('GameScene')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start space-y-2 px-2 sm:px-4 pt-2 sm:pt-4">
      {/* No header - cleaner look */}

      {/* Game Canvas */}
      <div 
        ref={gameRef}
        className="game-container border-4 border-white/20 rounded-lg shadow-2xl mx-auto"
        style={{ 
          width: '100%', 
          height: 'auto',
          aspectRatio: '4/3',
          maxWidth: '600px',
          maxHeight: '450px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      />

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={gameState.highScore || 0}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  )
}

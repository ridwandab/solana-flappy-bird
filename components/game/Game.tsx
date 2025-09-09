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

// Hook to detect mobile device and orientation
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen))
      setIsPortrait(window.innerHeight > window.innerWidth)
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  return { isMobile, isPortrait, screenSize }
}

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { gameState, updateHighScore } = useGameState()
  const { saveHighScore, getHighScore } = useHighScore()
  const { quests, acceptQuest } = useQuestIntegration(phaserGameRef.current)
  const { settings, getGamePhysicsConfig, getAudioConfig, getGraphicsConfig } = useSettings()
  const { isMobile, isPortrait, screenSize } = useMobileDetection()
  
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

    // Calculate responsive dimensions
    const getGameDimensions = () => {
      if (isMobile) {
        if (isPortrait) {
          // Portrait: use full screen width, maintain aspect ratio
          const width = Math.min(screenSize.width, 400)
          const height = Math.min(screenSize.height, 600)
          return { width, height }
        } else {
          // Landscape: use full screen
          const width = Math.min(screenSize.width, 800)
          const height = Math.min(screenSize.height, 400)
          return { width, height }
        }
      } else {
        // Desktop: use fixed dimensions
        return { width: 800, height: 600 }
      }
    }

    const dimensions = getGameDimensions()

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: dimensions.width,
      height: dimensions.height,
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
        mode: isMobile ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: dimensions.width,
        height: dimensions.height,
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

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [isMobile, isPortrait, screenSize]) // Recreate game when orientation changes

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (gameRef.current?.requestFullscreen) {
        gameRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Mobile responsive layout
  if (isMobile) {
    return (
      <div className={`${isPortrait ? 'portrait-fullscreen' : 'landscape-fullscreen'} mobile-game-container no-select`}>
        {/* Mobile Game Header - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className={`${isPortrait ? 'portrait-hide-ui' : 'landscape-hide-ui'} flex items-center justify-between w-full p-4 bg-black/20 backdrop-blur-md`}>
            <div className="flex items-center space-x-2">
              <button
                onClick={onBackToMenu}
                className="btn-secondary mobile-button text-sm px-3 py-2"
              >
                ← Menu
              </button>
              <button
                onClick={handlePause}
                className="btn-primary mobile-button text-sm px-3 py-2"
              >
                Pause
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-white/80">Score</p>
                <p className="text-lg font-bold text-white">{score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/80">High</p>
                <p className="text-sm font-bold text-yellow-400">
                  {gameState.highScore || 0}
                </p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="btn-primary mobile-button text-sm px-3 py-2"
              >
                {isFullscreen ? 'Exit' : 'Full'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Game Canvas */}
        <div 
          ref={gameRef}
          className={`${isPortrait ? 'portrait-game-canvas' : 'landscape-game-canvas'} mobile-game-canvas game-canvas-container`}
          style={{ 
            width: isMobile ? '100vw' : '800px', 
            height: isMobile ? '100vh' : '600px' 
          }}
          onTouchStart={(e) => {
            // Prevent default touch behavior
            e.preventDefault()
            // Trigger bird flap on touch
            if (phaserGameRef.current && !isGameOver && !isPaused) {
              phaserGameRef.current.events.emit('flap')
            }
          }}
        />

        {/* Mobile Touch Controls */}
        {isMobile && !isFullscreen && (
          <div className="mobile-controls">
            <button
              className="mobile-control-button"
              onTouchStart={(e) => {
                e.preventDefault()
                if (phaserGameRef.current && !isGameOver && !isPaused) {
                  phaserGameRef.current.events.emit('flap')
                }
              }}
              onClick={(e) => {
                e.preventDefault()
                if (phaserGameRef.current && !isGameOver && !isPaused) {
                  phaserGameRef.current.events.emit('flap')
                }
              }}
            >
              🐦
            </button>
            <button
              className="mobile-control-button"
              onTouchStart={(e) => {
                e.preventDefault()
                handlePause()
              }}
              onClick={(e) => {
                e.preventDefault()
                handlePause()
              }}
            >
              ⏸️
            </button>
          </div>
        )}

        {/* Mobile Game Over Modal */}
        {isGameOver && (
          <GameOverModal
            score={score}
            highScore={gameState.highScore || 0}
            onRestart={handleRestart}
            onBackToMenu={onBackToMenu}
          />
        )}

        {/* Mobile Pause Modal */}
        {isPaused && (
          <PauseModal
            onResume={handleResume}
            onBackToMenu={onBackToMenu}
          />
        )}
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Desktop Game Header */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToMenu}
            className="btn-secondary"
          >
            ← Back to Menu
          </button>
          <button
            onClick={handlePause}
            className="btn-primary"
          >
            Pause
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-primary"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-white/80">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/80">High Score</p>
            <p className="text-xl font-bold text-yellow-400">
              {gameState.highScore || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Game Canvas */}
      <div 
        ref={gameRef}
        className="border-4 border-white/20 rounded-lg shadow-2xl"
        style={{ width: '800px', height: '600px' }}
      />

      {/* Desktop Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={gameState.highScore || 0}
          onRestart={handleRestart}
          onBackToMenu={onBackToMenu}
        />
      )}

      {/* Desktop Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onBackToMenu={onBackToMenu}
        />
      )}
    </div>
  )
}

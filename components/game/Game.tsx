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
import { useCosmetics } from '@/hooks/useCosmetics'

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
  const { getSelectedCosmetic } = useCosmetics()
  
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

    // Get selected cosmetic
    const selectedCosmetic = publicKey ? getSelectedCosmetic(publicKey.toString()) : null

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: physicsConfig.gravity },
          debug: graphicsConfig.showFPS,
        },
      },
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    phaserGameRef.current = new Phaser.Game(config)
    
    // Pass settings and cosmetic data to game scene
    const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene
    if (gameScene) {
      gameScene.setSettings(settings)
      // Pass selected cosmetic data
      if (selectedCosmetic) {
        gameScene.init({ selectedCosmetic })
      }
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
    <div className="flex flex-col items-center space-y-6">
      {/* Game Header */}
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

      {/* Game Canvas */}
      <div 
        ref={gameRef}
        className="border-4 border-white/20 rounded-lg shadow-2xl"
        style={{ width: '800px', height: '600px' }}
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

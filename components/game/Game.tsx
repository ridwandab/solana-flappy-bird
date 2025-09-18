'use client'

import { FC, useEffect, useRef } from 'react'
import { GameScene } from './GameScene'
import { useSettings } from '@/hooks/useSettings'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePlayerName } from '@/hooks/usePlayerName'
import { useQuestIntegration } from '@/hooks/useQuestIntegration'

interface GameProps {
  onBackToMenu?: () => void
}

export const Game: FC<GameProps> = ({ onBackToMenu }) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const { settings, getGamePhysicsConfig, getAudioConfig, getGraphicsConfig } = useSettings()
  const { publicKey, connected } = useWallet()
  const { getDisplayName } = usePlayerName()

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 930,
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

    // Add event listener for goToMainMenu
    if (phaserGameRef.current) {
      phaserGameRef.current.events.on('goToMainMenu', () => {
        console.log('Main Menu button clicked - going back to menu')
        if (onBackToMenu) {
          onBackToMenu()
        }
      })

      // Add event listener for getPlayerData
      phaserGameRef.current.events.on('getPlayerData', (callback: (data: any) => void) => {
        console.log('getPlayerData event received')
        console.log('Wallet connected:', connected)
        console.log('Public key:', publicKey?.toString())
        console.log('Display name:', getDisplayName())
        
        if (connected && publicKey) {
          const playerData = {
            walletAddress: publicKey.toString(),
            playerName: getDisplayName()
          }
          console.log('Sending player data:', playerData)
          callback(playerData)
        } else {
          console.log('Wallet not connected, sending null')
          callback(null)
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
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900" style={{ height: '930px' }}>
      {/* Game Container - centered with exact height */}
      <div 
        ref={gameRef} 
        className="shadow-2xl"
        style={{ width: '800px', height: '930px' }}
      />
    </div>
  )
}

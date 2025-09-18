'use client'

import { FC, useEffect, useRef } from 'react'
import { GameScene } from './GameScene'
import { useSettings } from '@/hooks/useSettings'
import { useWallet } from '@solana/wallet-adapter-react'
import { usePlayerName } from '@/hooks/usePlayerName'

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
      width: window.innerWidth,
      height: window.innerHeight,
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
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      }
    }

    phaserGameRef.current = new Phaser.Game(config)

    // Add window resize listener for responsive design
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight)
      }
    }
    
    window.addEventListener('resize', handleResize)

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
      window.removeEventListener('resize', handleResize)
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [onBackToMenu])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden">
      {/* Game Container - responsive and full screen */}
      <div 
        ref={gameRef} 
        className="shadow-2xl w-full h-full max-w-full max-h-full"
        style={{ 
          width: '100vw', 
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      />
    </div>
  )
}

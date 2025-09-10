'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// Dynamic imports to prevent SSR issues
const WalletProvider = dynamic(() => import('@/components/wallet/WalletProvider').then(mod => ({ default: mod.WalletProvider })), { ssr: false })
const AudioInitializer = dynamic(() => import('@/components/AudioInitializer').then(mod => ({ default: mod.AudioInitializer })), { ssr: false })
const MainMenu = dynamic(() => import('@/components/ui/MainMenu').then(mod => ({ default: mod.MainMenu })), { ssr: false })
const Game = dynamic(() => import('@/components/game/Game').then(mod => ({ default: mod.Game })), { ssr: false })
const Store = dynamic(() => import('@/components/store/Store').then(mod => ({ default: mod.Store })), { ssr: false })
const Leaderboard = dynamic(() => import('@/components/leaderboard/Leaderboard').then(mod => ({ default: mod.Leaderboard })), { ssr: false })
const QuestSystem = dynamic(() => import('@/components/quest/QuestSystem').then(mod => ({ default: mod.QuestSystem })), { ssr: false })
const Settings = dynamic(() => import('@/components/ui/Settings').then(mod => ({ default: mod.Settings })), { ssr: false })

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'menu' | 'game' | 'store' | 'leaderboard' | 'quests' | 'settings'>('menu')
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const renderView = () => {
    switch (currentView) {
      case 'game':
        return <Game />
      case 'store':
        return <Store />
      case 'leaderboard':
        return <Leaderboard />
      case 'quests':
        return <QuestSystem />
      case 'settings':
        return <Settings />
      default:
        return (
          <MainMenu
            onStartGame={() => setCurrentView('game')}
            onOpenStore={() => setCurrentView('store')}
            onOpenLeaderboard={() => setCurrentView('leaderboard')}
            onOpenQuests={() => setCurrentView('quests')}
            onOpenSettings={() => setCurrentView('settings')}
          />
        )
    }
  }

  return (
    <WalletProvider>
      <AudioInitializer>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/Bird2-export.png" 
                    alt="Solana Flappy Bird" 
                    className="w-8 h-8"
                  />
                  <h1 className="text-2xl font-bold text-white">
                    Solana Flappy Bird
                  </h1>
                </div>
                {currentView !== 'menu' && (
                  <button
                    onClick={() => setCurrentView('menu')}
                    className="text-white/80 hover:text-white transition-colors ml-4"
                  >
                    ← Kembali ke Menu
                  </button>
                )}
              </div>
              {/* WalletMultiButton is now part of WalletProvider */}
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-20 pb-8">
            <div className="container mx-auto px-4">
              {renderView()}
            </div>
          </main>

          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
            <div className="container mx-auto px-4 py-2 text-center text-white/60 text-sm">
              Powered by Solana • Built with Next.js & Phaser 3
            </div>
          </footer>
        </div>
      </AudioInitializer>
    </WalletProvider>
  )
}

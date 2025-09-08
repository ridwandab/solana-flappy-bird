'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  Play, 
  Trophy, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Gift,
  Star
} from 'lucide-react'
import { QuestProgressTracker } from '@/components/quest/QuestRewardSystem'
import { useGlobalAudio } from '@/hooks/useGlobalAudio'

interface MainMenuProps {
  onStartGame: () => void
  onOpenStore: () => void
  onOpenLeaderboard: () => void
  onOpenQuests: () => void
  onOpenSettings: () => void
}

export const MainMenu: FC<MainMenuProps> = ({
  onStartGame,
  onOpenStore,
  onOpenLeaderboard,
  onOpenQuests,
  onOpenSettings
}) => {
  const { publicKey } = useWallet()
  const [showQuestTracker, setShowQuestTracker] = useState(false)
  const { startBackgroundMusic, resumeAudioContext, startMusicImmediately } = useGlobalAudio()

  // Start background music immediately when component mounts
  useEffect(() => {
    // Try to start music immediately
    const tryStartMusic = async () => {
      const success = await startMusicImmediately()
      
      if (!success) {
        console.log('🎵 Audio context needs user interaction, setting up fallback')
        // Fallback: Start music on first user interaction
        const handleUserInteraction = () => {
          resumeAudioContext()
          startBackgroundMusic()
          console.log('🎵 Background music started after user interaction')
          // Remove event listeners after first interaction
          document.removeEventListener('click', handleUserInteraction)
          document.removeEventListener('keydown', handleUserInteraction)
        }

        document.addEventListener('click', handleUserInteraction)
        document.addEventListener('keydown', handleUserInteraction)

        return () => {
          document.removeEventListener('click', handleUserInteraction)
          document.removeEventListener('keydown', handleUserInteraction)
        }
      }
    }

    tryStartMusic()
  }, [startBackgroundMusic, resumeAudioContext, startMusicImmediately])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-6xl">🐦</div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                Solana Flappy Bird
              </h1>
              <p className="text-white/60 text-lg">
                Play, Earn, and Collect SOL Rewards!
              </p>
            </div>
          </div>
          
          {publicKey && (
            <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white text-sm">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* Main Menu Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Play Game */}
          <button
            onClick={onStartGame}
            className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Play Game</h2>
              <p className="text-green-100">Start your adventure and earn SOL!</p>
            </div>
          </button>

          {/* Quest System */}
          <button
            onClick={onOpenQuests}
            className="group bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Quests</h2>
              <p className="text-yellow-100">Complete quests to earn free SOL!</p>
            </div>
          </button>

          {/* Cosmetic Store */}
          <button
            onClick={onOpenStore}
            className="group bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Store</h2>
              <p className="text-purple-100">Buy cosmetics with SOL</p>
            </div>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="group bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Leaderboard</h2>
              <p className="text-blue-100">See top players</p>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="group bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-gray-100">Game preferences</p>
            </div>
          </button>

          {/* Quest Tracker */}
          <button
            onClick={() => setShowQuestTracker(true)}
            className="group bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center">
              <Gift className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Rewards</h2>
              <p className="text-indigo-100">Check your progress</p>
            </div>
          </button>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            🎮 Game Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="text-lg font-semibold text-white mb-1">Quest System</h4>
              <p className="text-white/60 text-sm">
                Complete daily, weekly, and achievement quests to earn free SOL rewards!
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <h4 className="text-lg font-semibold text-white mb-1">Cosmetic Store</h4>
              <p className="text-white/60 text-sm">
                Buy unique bird skins and backgrounds with your earned SOL.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-lg font-semibold text-white mb-1">Leaderboard</h4>
              <p className="text-white/60 text-sm">
                Compete with other players and climb the rankings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/40 text-sm">
          <p>Powered by Solana • Built with Next.js & Phaser 3</p>
        </div>
      </div>

      {/* Quest Progress Tracker */}
      <QuestProgressTracker />
    </div>
  )
}
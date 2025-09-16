'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  Play, 
  Trophy, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Gift,
  Star,
  User
} from 'lucide-react'
import { QuestProgressTracker } from '@/components/quest/QuestRewardSystem'
import { useGlobalAudio } from '@/hooks/useGlobalAudio'
import { PlayerNameModal } from './PlayerNameModal'
import { usePlayerName } from '@/hooks/usePlayerName'

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
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false)
  const { resumeAudioContext } = useGlobalAudio()
  const { playerName, savePlayerName, getDisplayName } = usePlayerName()

  // Initialize audio context for sound effects
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await resumeAudioContext()
        console.log('🔊 Audio context initialized for sound effects')
      } catch (error) {
        console.log('🔊 Audio context initialization failed:', error)
      }
    }

    initializeAudio()
  }, [resumeAudioContext])

  // Handle start game with player name
  const handleStartGame = () => {
    // Check if wallet is connected first
    if (!publicKey) {
      console.log('Wallet not connected, cannot start game')
      return
    }
    
    if (!playerName) {
      setShowPlayerNameModal(true)
    } else {
      onStartGame()
    }
  }

  // Handle player name confirmation
  const handlePlayerNameConfirm = (name: string) => {
    if (savePlayerName(name)) {
      onStartGame()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/Bird2-export.png" alt="Solana Flappy Bird" className="w-12 h-12" />
              <h1 className="text-5xl font-bold text-white">
                Solana Flappy Bird
              </h1>
            </div>
            <p className="text-white/60 text-lg">
              Play, Earn, and Collect SOL Rewards!
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !text-white !font-semibold !px-6 !py-3 !rounded-full !transition-all !duration-300 hover:!scale-105" />
            
            {/* Player Name Display - Only show when wallet is connected */}
            {publicKey && playerName && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-sm">
                  Playing as: <span className="font-semibold text-white">{getDisplayName()}</span>
                </span>
                <button
                  onClick={() => setShowPlayerNameModal(true)}
                  className="text-white/60 hover:text-white text-xs underline"
                >
                  Change
                </button>
              </div>
            )}
            
            {/* Wallet Connection Status */}
            {!publicKey && (
              <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-200 text-sm">
                  Connect your wallet to start playing
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Play Game */}
          <button
            onClick={handleStartGame}
            disabled={!publicKey}
            className={`group p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              publicKey 
                ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                : 'bg-gradient-to-br from-gray-500 to-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Play Game</h2>
              <p className={publicKey ? 'text-green-100' : 'text-gray-400'}>
                {!publicKey 
                  ? 'Connect wallet first to play!' 
                  : playerName 
                    ? `Start your adventure, ${getDisplayName()}!` 
                    : 'Enter your name to start!'
                }
              </p>
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

      {/* Player Name Modal - Only show when wallet is connected */}
      {publicKey && (
        <PlayerNameModal
          isOpen={showPlayerNameModal}
          onClose={() => setShowPlayerNameModal(false)}
          onConfirm={handlePlayerNameConfirm}
          defaultName={playerName}
        />
      )}
    </div>
  )
}
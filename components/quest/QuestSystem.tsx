'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useQuests } from '@/hooks/useQuests'
import { useCustomPopup } from '@/components/ui/CustomPopup'
import { useSolBalance } from '@/hooks/useSolBalance'
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  Coins, 
  CheckCircle, 
  Play, 
  Award,
  Calendar,
  Zap,
  Info
} from 'lucide-react'

interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'achievement'
  reward: number // SOL amount
  progress: number
  target: number
  completed: boolean
  claimed: boolean
  accepted: boolean
  icon: string
  category: string
  lastUpdated: string
}

export const QuestSystem: FC = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { quests, acceptQuest, claimQuestReward } = useQuests()
  const { showPopup, PopupComponent } = useCustomPopup()
  const { earnedSol, balance, transferEarnedSol, addEarnedSol, isLoading: isTransferLoading, getTransferHistory } = useSolBalance()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showRealTransferModal, setShowRealTransferModal] = useState(false)
  const [apiKey, setApiKey] = useState('')

  // Removed loadQuests function - now using useQuests hook


  const claimReward = async (quest: Quest) => {
    if (!publicKey || !sendTransaction) {
      showPopup('Please connect your wallet to claim rewards', 'warning')
      return
    }

    setIsLoading(true)
    try {
      // Use the claimQuestReward function from useQuests hook
      await claimQuestReward(quest.id)
      // Add SOL to earned balance
      addEarnedSol(quest.reward)
      showPopup(`🎉 Reward claimed! You received ${quest.reward} SOL!`, 'success')
      
    } catch (error) {
      console.error('Failed to claim reward:', error)
      showPopup('Failed to claim reward. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  const handleRealTransferSol = async () => {
    if (!publicKey) {
      showPopup('Please connect your wallet to transfer SOL', 'warning')
      return
    }

    if (earnedSol <= 0) {
      showPopup('No SOL to transfer', 'warning')
      return
    }

    // Show real transfer modal
    setShowRealTransferModal(true)
  }


  const confirmRealTransfer = async () => {
    // Double check if there's SOL to transfer
    if (earnedSol <= 0) {
      showPopup('No SOL available to transfer. Complete quests to earn SOL first!', 'warning')
      setShowRealTransferModal(false)
      return
    }
    
    setShowRealTransferModal(false)
    
    try {
      // Execute transfer
      const result = await transferEarnedSol(true) // Real transfer (no API key needed)
      showPopup(`🎉 ${result.amount} SOL transferred to your wallet! TX: ${result.transactionId.slice(0, 8)}...`, 'success')
    } catch (error) {
      console.error('Real transfer failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showPopup(`Failed to transfer SOL: ${errorMessage}`, 'error')
    }
  }

  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />
      case 'weekly': return <Clock className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-green-400 bg-green-400/20'
      case 'weekly': return 'text-blue-400 bg-blue-400/20'
      case 'achievement': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const filteredQuests = selectedCategory === 'all' 
    ? quests 
    : quests.filter(quest => quest.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All Quests', icon: <Star className="w-4 h-4" /> },
    { id: 'gameplay', name: 'Gameplay', icon: <Play className="w-4 h-4" /> },
    { id: 'achievement', name: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'cosmetic', name: 'Cosmetics', icon: <Award className="w-4 h-4" /> }
  ]

  return (
    <>
      {PopupComponent}
      
      
      <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <span>Quest System</span>
          </h1>
          <p className="text-white/60 mt-2">
            Complete quests to earn free SOL rewards!
          </p>
        </div>
        
      </div>

      {/* Quest Reset Info */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">Quest Reset Schedule</h3>
            <p className="text-white/60 text-sm">
              Daily quests reset every day at midnight • Weekly quests reset every Monday
            </p>
          </div>
        </div>
      </div>

      {/* Quest Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              selectedCategory === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Quest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {quests.filter(q => q.completed).length}
            </span>
          </div>
          <p className="text-white/60">Completed Quests</p>
        </div>
        
        <div 
          className={`card text-center transition-colors ${
            earnedSol > 0 
              ? 'cursor-pointer hover:bg-white/5' 
              : 'cursor-not-allowed opacity-60'
          }`}
          onClick={() => earnedSol > 0 && setShowRealTransferModal(true)}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Coins className={`w-6 h-6 ${earnedSol > 0 ? 'text-yellow-400' : 'text-gray-500'}`} />
            <span className={`text-2xl font-bold ${earnedSol > 0 ? 'text-white' : 'text-gray-500'}`}>
              {earnedSol.toFixed(3)}
            </span>
          </div>
          <p className="text-white/60">SOL Available</p>
          {earnedSol > 0 ? (
            <p className="text-xs text-white/40 mt-1">Click to transfer</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Complete quests to earn SOL</p>
          )}
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {quests.filter(q => !q.completed).length}
            </span>
          </div>
          <p className="text-white/60">Available Quests</p>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">
          {selectedCategory === 'all' ? 'All Quests' : categories.find(c => c.id === selectedCategory)?.name}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map(quest => (
            <div key={quest.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{quest.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getQuestTypeColor(quest.type)}`}>
                      {getQuestTypeIcon(quest.type)}
                      <span className="capitalize">{quest.type}</span>
                      {quest.type === 'daily' && (
                        <span className="text-xs opacity-75">• Resets daily</span>
                      )}
                      {quest.type === 'weekly' && (
                        <span className="text-xs opacity-75">• Resets weekly</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">{quest.reward} SOL</span>
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 mb-4">{quest.description}</p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/60 mb-1">
                  <span>Progress</span>
                  <span>{quest.progress}/{quest.target}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Quest Button */}
              <button
                onClick={() => {
                  if (!quest.accepted) {
                    acceptQuest(quest.id)
                  } else if (quest.completed && !quest.claimed) {
                    claimReward(quest)
                  }
                }}
                disabled={isLoading || (quest.accepted && quest.progress < quest.target)}
                className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  quest.claimed
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : quest.completed && !quest.claimed
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
                    : quest.accepted
                    ? 'bg-blue-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                }`}
              >
                {quest.claimed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Claimed</span>
                  </>
                ) : quest.completed && !quest.claimed ? (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Claim Reward</span>
                  </>
                ) : quest.accepted ? (
                  <>
                    <Target className="w-4 h-4" />
                    <span>In Progress</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Accept Quest</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Connection Notice */}
      {!publicKey && (
        <div className="card text-center">
          <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-white/60">
            Connect your Solana wallet to claim SOL rewards from completed quests!
          </p>
        </div>
      )}

      {/* Real Transfer Modal */}
      {showRealTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRealTransferModal(false)} />
          <div className="relative z-10 bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Transfer SOL
            </h3>
            
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
                <Coins className="w-8 h-8" />
                <span className="text-3xl font-bold">
                  {earnedSol.toFixed(3)} SOL
                </span>
              </div>
              <p className="text-white/60 text-sm text-center">
                Transfer to your wallet
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRealTransferModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRealTransfer}
                disabled={isTransferLoading || earnedSol <= 0}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  earnedSol > 0 && !isTransferLoading
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isTransferLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transferring...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Transfer to Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

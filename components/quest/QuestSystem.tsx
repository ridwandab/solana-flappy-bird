'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useQuests } from '@/hooks/useQuests'
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
  Zap
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
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Removed loadQuests function - now using useQuests hook

  const claimReward = async (quest: Quest) => {
    if (!publicKey || !sendTransaction) {
      alert('Please connect your wallet to claim rewards')
      return
    }

    setIsLoading(true)
    try {
      // Use the claimQuestReward function from useQuests hook
      await claimQuestReward(quest.id)
      alert(`🎉 Reward claimed! You received ${quest.reward} SOL!`)
      
    } catch (error) {
      console.error('Failed to claim reward:', error)
      alert('Failed to claim reward. Please try again.')
    } finally {
      setIsLoading(false)
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
        
        {/* Back to Menu button removed */}
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
        
        <div className="card text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-2xl font-bold text-white">
              {quests.filter(q => q.completed).reduce((sum, q) => sum + q.reward, 0).toFixed(3)}
            </span>
          </div>
          <p className="text-white/60">SOL Earned</p>
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
    </div>
  )
}

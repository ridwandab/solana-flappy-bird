'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useQuests } from '@/hooks/useQuests'
import { simulateSOLReward } from '@/lib/solanaRewards'
import { 
  Gift, 
  Coins, 
  CheckCircle, 
  X, 
  Zap,
  Trophy,
  Star,
  ExternalLink
} from 'lucide-react'

interface QuestRewardSystemProps {
  isOpen: boolean
  onClose: () => void
  questId?: string
  rewardAmount?: number
}

export const QuestRewardSystem: FC<QuestRewardSystemProps> = ({
  isOpen,
  onClose,
  questId,
  rewardAmount = 0
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { claimQuestReward, quests } = useQuests()
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [transactionSignature, setTransactionSignature] = useState<string>('')
  const [actualRewardAmount, setActualRewardAmount] = useState<number>(0)

  const quest = questId ? quests.find(q => q.id === questId) : null

  const handleClaimReward = async () => {
    if (!wallet.publicKey || !quest) return

    setIsClaiming(true)
    try {
      console.log(`Claiming reward: ${quest.reward} SOL for quest: ${quest.title}`)
      
      // Send SOL reward to user's wallet
      const rewardResult = await simulateSOLReward(
        wallet,
        quest.reward,
        quest.id
      )
      
      // Store transaction details
      setTransactionSignature(rewardResult.signature)
      setActualRewardAmount(rewardResult.amount)
      
      // Mark quest as claimed
      await claimQuestReward(quest.id)
      
      setClaimSuccess(true)
      
      // Auto close after 5 seconds
      setTimeout(() => {
        onClose()
        setClaimSuccess(false)
        setTransactionSignature('')
        setActualRewardAmount(0)
      }, 5000)
      
    } catch (error) {
      console.error('Failed to claim reward:', error)
      alert('Failed to claim reward. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  const sendSOLReward = async (amount: number) => {
    if (!wallet.publicKey || !wallet.sendTransaction) return

    try {
      // Create a transaction to send SOL from treasury to user
      // In a real app, this would be handled by a backend service
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey('11111111111111111111111111111111'), // Treasury address
          toPubkey: wallet.publicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      
      console.log(`SOL reward sent: ${signature}`)
      return signature
      
    } catch (error) {
      console.error('Failed to send SOL reward:', error)
      throw error
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-primary-900 to-secondary-900 rounded-2xl p-8 max-w-md w-full border border-white/10">
        {claimSuccess ? (
          // Success State
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Reward Claimed!
            </h2>
            
            <p className="text-white/60 mb-6">
              You received <span className="text-yellow-400 font-semibold">{actualRewardAmount} SOL</span>!
            </p>
            
            {transactionSignature && (
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Transaction ID:</span>
                  <button
                    onClick={() => {
                      // In production, this would open Solscan/Solana Explorer
                      navigator.clipboard.writeText(transactionSignature)
                      alert('Transaction ID copied to clipboard!')
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/80 text-xs font-mono break-all">
                  {transactionSignature}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Quest Completed</span>
            </div>
            
            <div className="text-center">
              <p className="text-white/60 text-sm">
                SOL has been sent to your Phantom wallet!
              </p>
            </div>
          </div>
        ) : (
          // Claim State
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Quest Reward!
            </h2>
            
            {quest && (
              <div className="mb-6">
                <div className="text-4xl mb-2">{quest.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {quest.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {quest.description}
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 text-yellow-400">
                    <Coins className="w-6 h-6" />
                    <span className="text-2xl font-bold">
                      {quest.reward} SOL
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    Reward Amount
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleClaimReward}
                disabled={isClaiming || !publicKey}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Claim Reward</span>
                  </>
                )}
              </button>
            </div>
            
            {!publicKey && (
              <p className="text-red-400 text-sm mt-4">
                Please connect your wallet to claim rewards
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

// Quest Progress Tracker Component
export const QuestProgressTracker: FC = () => {
  const { quests, getQuestStats } = useQuests()
  const [showTracker, setShowTracker] = useState(false)

  const stats = getQuestStats()
  const availableRewards = quests.filter(q => q.completed && !q.claimed)

  return (
    <>
      {/* Quest Tracker Button */}
      <button
        onClick={() => setShowTracker(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        title="Quest Progress"
      >
        <Trophy className="w-6 h-6" />
        {availableRewards.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {availableRewards.length}
          </div>
        )}
      </button>

      {/* Quest Tracker Modal */}
      {showTracker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-primary-900 to-secondary-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span>Quest Progress</span>
              </h2>
              <button
                onClick={() => setShowTracker(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-white/60 text-sm">Completed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.availableReward.toFixed(3)}</div>
                <div className="text-white/60 text-sm">SOL Available</div>
              </div>
            </div>

            {/* Available Rewards */}
            {availableRewards.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Available Rewards:</h3>
                {availableRewards.map(quest => (
                  <div key={quest.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{quest.icon}</div>
                      <div>
                        <div className="text-white font-medium">{quest.title}</div>
                        <div className="text-white/60 text-sm">{quest.reward} SOL</div>
                      </div>
                    </div>
                    <div className="text-yellow-400">
                      <Star className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-white/60">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rewards available</p>
                <p className="text-sm">Complete more quests to earn SOL!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

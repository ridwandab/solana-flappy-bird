import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useQuests } from './useQuests'

export const useSolBalance = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { quests } = useQuests()
  const [balance, setBalance] = useState(0)
  const [earnedSol, setEarnedSol] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Load earned SOL from localStorage and sync with claimed quests
  useEffect(() => {
    const savedEarnedSol = localStorage.getItem('earnedSol')
    if (savedEarnedSol) {
      setEarnedSol(parseFloat(savedEarnedSol))
    }
  }, [])

  // Sync earned SOL with claimed quests
  useEffect(() => {
    const claimedQuestsTotal = quests
      .filter(q => q.claimed)
      .reduce((sum, q) => sum + q.reward, 0)
    
    // Only update if there's a difference to avoid infinite loops
    if (Math.abs(claimedQuestsTotal - earnedSol) > 0.001) {
      setEarnedSol(claimedQuestsTotal)
      localStorage.setItem('earnedSol', claimedQuestsTotal.toString())
    }
  }, [quests, earnedSol])

  // Load wallet balance
  useEffect(() => {
    if (publicKey) {
      const loadBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Failed to load balance:', error)
        }
      }
      loadBalance()
    }
  }, [publicKey, connection])

  // Add earned SOL (called when quest reward is claimed)
  const addEarnedSol = (amount: number) => {
    const newEarnedSol = earnedSol + amount
    setEarnedSol(newEarnedSol)
    localStorage.setItem('earnedSol', newEarnedSol.toString())
  }

  // Transfer earned SOL to wallet
  const transferEarnedSol = async () => {
    if (!publicKey || !sendTransaction || earnedSol <= 0) {
      throw new Error('Cannot transfer: No wallet connected or no SOL to transfer')
    }

    setIsLoading(true)
    try {
      // Create transaction to send SOL to the connected wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey, // This should be the game's treasury wallet in production
          toPubkey: publicKey,   // Player's wallet
          lamports: Math.floor(earnedSol * LAMPORTS_PER_SOL),
        })
      )

      // For demo purposes, we'll simulate the transfer
      // In production, you would need a treasury wallet to send from
      console.log(`Simulating transfer of ${earnedSol} SOL to wallet ${publicKey.toString()}`)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear earned SOL after successful transfer
      setEarnedSol(0)
      localStorage.setItem('earnedSol', '0')
      
      return {
        success: true,
        amount: earnedSol,
        transactionId: 'simulated-tx-' + Date.now()
      }
      
    } catch (error) {
      console.error('Transfer failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Reset earned SOL (for testing)
  const resetEarnedSol = () => {
    setEarnedSol(0)
    localStorage.setItem('earnedSol', '0')
  }

  return {
    balance,
    earnedSol,
    isLoading,
    addEarnedSol,
    transferEarnedSol,
    resetEarnedSol
  }
}

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
  const [transferCompleted, setTransferCompleted] = useState(false)

  // Load earned SOL and transfer status from localStorage
  useEffect(() => {
    const savedEarnedSol = localStorage.getItem('earnedSol')
    if (savedEarnedSol) {
      setEarnedSol(parseFloat(savedEarnedSol))
    }
    
    // Load transfer completed status
    const savedTransferCompleted = localStorage.getItem('transferCompleted')
    if (savedTransferCompleted === 'true') {
      setTransferCompleted(true)
      console.log('💰 Transfer completed status loaded from localStorage')
    }
  }, [])

  // Sync earned SOL with claimed quests (but not after transfer)
  useEffect(() => {
    if (transferCompleted) {
      console.log('💰 Transfer completed, skipping sync with claimed quests')
      return
    }
    
    const claimedQuestsTotal = quests
      .filter(q => q.claimed)
      .reduce((sum, q) => sum + q.reward, 0)
    
    // Only update if there's a difference to avoid infinite loops
    if (Math.abs(claimedQuestsTotal - earnedSol) > 0.001) {
      console.log('💰 Syncing earned SOL with claimed quests:', claimedQuestsTotal)
      setEarnedSol(claimedQuestsTotal)
      localStorage.setItem('earnedSol', claimedQuestsTotal.toString())
    }
  }, [quests, earnedSol, transferCompleted])

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
    setTransferCompleted(false) // Reset transfer flag when new SOL is earned
    localStorage.setItem('transferCompleted', 'false') // Save transfer status
  }

  // Transfer earned SOL to wallet
  const transferEarnedSol = async (useRealTransfer: boolean = false) => {
    console.log('💰 Transfer attempt - Debug info:', {
      publicKey: publicKey?.toString(),
      earnedSol,
      useRealTransfer
    })
    
    if (!publicKey) {
      console.error('💰 Transfer failed: No wallet connected')
      throw new Error('Cannot transfer: No wallet connected')
    }
    
    if (earnedSol <= 0) {
      console.error('💰 Transfer failed: No SOL to transfer, earnedSol:', earnedSol)
      throw new Error('Cannot transfer: No SOL to transfer')
    }

    setIsLoading(true)
    try {
      // Choose API endpoint based on transfer type
      const endpoint = useRealTransfer ? '/api/simple-transfer-sol' : '/api/transfer-sol'
      console.log(`Transferring ${earnedSol} SOL to ${publicKey.toString()} using ${useRealTransfer ? 'REAL' : 'SIMULATED'} transfer`)
      
      const requestBody: any = {
        playerWallet: publicKey.toString(),
        amount: earnedSol
      }

      // No API key needed for simple transfer
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      console.log('💰 Transfer API response:', result)

      if (!response.ok) {
        console.error('💰 Transfer API error:', result)
        throw new Error(result.error || 'Transfer failed')
      }

      console.log('💰 Transfer successful! Result:', result)

      // Clear earned SOL after successful transfer
      setEarnedSol(0)
      localStorage.setItem('earnedSol', '0')
      setTransferCompleted(true) // Prevent sync with claimed quests
      localStorage.setItem('transferCompleted', 'true') // Save transfer status
      
      // Refresh wallet balance after transfer
      if (publicKey) {
        try {
          console.log('💰 Refreshing wallet balance after transfer...')
          console.log('💰 Player wallet address:', publicKey.toString())
          console.log('💰 Transaction ID from API:', result.transactionId)
          
          // Wait a bit for transaction to be confirmed
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const newBalance = await connection.getBalance(publicKey)
          const newBalanceSOL = newBalance / LAMPORTS_PER_SOL
          setBalance(newBalanceSOL)
          
          console.log('💰 Wallet balance refreshed after transfer:', newBalanceSOL, 'SOL')
          console.log('💰 Transfer result:', result)
          console.log('💰 Transaction ID:', result.transactionId)
          
          // Verify transaction on blockchain
          try {
            const transactionInfo = await connection.getTransaction(result.transactionId)
            console.log('💰 Transaction verification:', transactionInfo ? 'CONFIRMED' : 'NOT FOUND')
            if (transactionInfo) {
              console.log('💰 Transaction details:', {
                slot: transactionInfo.slot,
                blockTime: transactionInfo.blockTime,
                meta: transactionInfo.meta
              })
            }
          } catch (verifyError) {
            console.error('💰 Failed to verify transaction:', verifyError)
          }
        } catch (error) {
          console.error('Failed to refresh wallet balance:', error)
        }
      }
      
      // Store transfer history for reference
      const transferHistory = JSON.parse(localStorage.getItem('transferHistory') || '[]')
      transferHistory.push({
        amount: earnedSol,
        to: publicKey.toString(),
        signature: result.transactionId,
        timestamp: result.timestamp,
        simulated: result.simulated || false,
        note: result.simulated ? 'Simulated transfer for demo purposes' : 'Real transfer via API endpoint'
      })
      localStorage.setItem('transferHistory', JSON.stringify(transferHistory))
      
      return {
        success: true,
        amount: earnedSol,
        transactionId: result.transactionId,
        simulated: result.simulated || false
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

  // Get transfer history
  const getTransferHistory = () => {
    try {
      return JSON.parse(localStorage.getItem('transferHistory') || '[]')
    } catch (error) {
      console.error('Failed to load transfer history:', error)
      return []
    }
  }

  // Clear transfer history
  const clearTransferHistory = () => {
    localStorage.removeItem('transferHistory')
  }

  return {
    balance,
    earnedSol,
    isLoading,
    addEarnedSol,
    transferEarnedSol,
    resetEarnedSol,
    getTransferHistory,
    clearTransferHistory
  }
}

'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export const usePlayerName = () => {
  const { publicKey } = useWallet()
  const [playerName, setPlayerName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Load player name from localStorage when wallet connects
  useEffect(() => {
    if (publicKey) {
      const savedName = localStorage.getItem(`playerName_${publicKey.toString()}`)
      if (savedName) {
        setPlayerName(savedName)
      }
    } else {
      setPlayerName('')
    }
  }, [publicKey])

  const savePlayerName = async (name: string): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem(`playerName_${publicKey.toString()}`, name)
      setPlayerName(name)
    } catch (error) {
      console.error('Error saving player name:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const clearPlayerName = () => {
    if (publicKey) {
      localStorage.removeItem(`playerName_${publicKey.toString()}`)
      setPlayerName('')
    }
  }

  return {
    playerName,
    setPlayerName,
    savePlayerName,
    clearPlayerName,
    isLoading,
    hasPlayerName: !!playerName,
    isWalletConnected: !!publicKey
  }
}

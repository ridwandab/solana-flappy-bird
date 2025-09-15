import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getPlayerName, savePlayerName, isSupabaseAvailable } from '@/lib/supabase'

export const usePlayerName = () => {
  const { publicKey } = useWallet()
  const [playerName, setPlayerName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey) {
      loadPlayerName()
    } else {
      setPlayerName('')
    }
  }, [publicKey])

  // Clear session storage when wallet changes
  useEffect(() => {
    if (publicKey) {
      // Clear any old session storage for different wallets
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('playerNameModalShown_') && !key.includes(publicKey.toString())) {
          sessionStorage.removeItem(key)
        }
      })
    }
  }, [publicKey])

  const loadPlayerName = async () => {
    if (!publicKey) return

    setIsLoading(true)
    setError(null)

    try {
      // Try to load from localStorage first (faster)
      const localName = localStorage.getItem(`playerName_${publicKey.toString()}`)
      if (localName) {
        setPlayerName(localName)
        console.log(`📝 Loaded player name from localStorage: ${localName}`)
      }

      // Then try to sync with Supabase if available
      if (isSupabaseAvailable()) {
        const supabaseName = await getPlayerName(publicKey.toString())
        if (supabaseName && supabaseName !== localName) {
          setPlayerName(supabaseName)
          // Update localStorage with Supabase data
          localStorage.setItem(`playerName_${publicKey.toString()}`, supabaseName)
          console.log(`🌐 Synced player name from Supabase: ${supabaseName}`)
        }
      }
    } catch (error) {
      console.error('Failed to load player name:', error)
      setError('Failed to load player name')
      
      // Fallback to localStorage
      const localName = localStorage.getItem(`playerName_${publicKey.toString()}`)
      if (localName) {
        setPlayerName(localName)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const savePlayerNameToDatabase = async (name: string) => {
    if (!publicKey) {
      console.error('❌ No public key available for saving player name')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`💾 Saving player name: "${name}" for address: ${publicKey.toString()}`)
      
      // Save to localStorage first
      localStorage.setItem(`playerName_${publicKey.toString()}`, name)
      setPlayerName(name)
      console.log(`✅ Player name saved to localStorage`)

      // Try to save to Supabase if available
      if (isSupabaseAvailable()) {
        console.log(`🌐 Supabase available, saving to database...`)
        await savePlayerName(publicKey.toString(), name)
        console.log(`✅ Player name saved to Supabase`)
      } else {
        console.log(`⚠️ Supabase not available, saved to localStorage only`)
      }

      return true
    } catch (error) {
      console.error('❌ Failed to save player name:', error)
      setError('Failed to save player name')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const hasPlayerName = () => {
    return playerName && playerName.trim().length > 0
  }

  const getDisplayName = () => {
    if (hasPlayerName()) {
      return playerName
    }
    
    if (publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    }
    
    return 'Anonymous'
  }

  const getShortDisplayName = () => {
    if (hasPlayerName()) {
      return playerName.length > 12 ? `${playerName.slice(0, 12)}...` : playerName
    }
    
    if (publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    }
    
    return 'Anonymous'
  }

  return {
    playerName,
    isLoading,
    error,
    hasPlayerName: hasPlayerName(),
    displayName: getDisplayName(),
    shortDisplayName: getShortDisplayName(),
    savePlayerName: savePlayerNameToDatabase,
    loadPlayerName,
  }
}

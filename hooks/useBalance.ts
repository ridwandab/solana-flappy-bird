import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'

export const useBalance = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey && connection) {
      loadBalance()
      // Removed automatic refresh - balance will only load when manually requested
    } else {
      setBalance(null)
    }
  }, [publicKey, connection])

  const loadBalance = async () => {
    if (!publicKey) {
      console.log('Cannot load balance: missing publicKey')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Loading balance for wallet: ${publicKey.toString()}`)
      console.log(`Using connection: ${connection.rpcEndpoint}`)
      
      // Use the connection from wallet provider first with timeout
      const balancePromise = connection.getBalance(publicKey)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const lamports = await Promise.race([balancePromise, timeoutPromise]) as number
      
      setBalance(lamports)
      console.log(`✅ Balance loaded successfully: ${lamports / LAMPORTS_PER_SOL} SOL from ${connection.rpcEndpoint}`)
      
    } catch (error) {
      console.warn(`❌ Failed to load balance from wallet connection:`, error)
      
      // Try multiple fallback RPC endpoints
      const fallbackEndpoints = [
        'https://rpc.ankr.com/solana',                   // Ankr RPC (Free tier)
        'https://solana-api.projectserum.com',           // Serum RPC
        'https://api.mainnet-beta.solana.com',           // Official Solana
        'https://api.devnet.solana.com',                 // Devnet as last resort
      ]
      
      let lastError: Error | null = null
      
      for (const endpoint of fallbackEndpoints) {
        try {
          console.log(`Trying fallback RPC: ${endpoint}`)
          const fallbackConnection = new Connection(endpoint, 'confirmed')
          
          // Add timeout for fallback requests too
          const balancePromise = fallbackConnection.getBalance(publicKey)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 8000)
          )
          
          const lamports = await Promise.race([balancePromise, timeoutPromise]) as number
          
          setBalance(lamports)
          console.log(`✅ Balance loaded successfully from ${endpoint}: ${lamports / LAMPORTS_PER_SOL} SOL`)
          return // Success, exit the function
          
        } catch (fallbackError) {
          console.warn(`❌ Failed to load balance from ${endpoint}:`, fallbackError)
          lastError = fallbackError instanceof Error ? fallbackError : new Error('Unknown error')
          continue // Try next endpoint
        }
      }
      
      // If all endpoints failed
      console.error('❌ All RPC endpoints failed to load balance')
      setError(`Failed to load balance from all endpoints. Last error: ${lastError?.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBalance = () => {
    loadBalance()
  }

  const formatBalance = (lamports: number): string => {
    const sol = lamports / LAMPORTS_PER_SOL
    if (sol >= 1) {
      return sol.toFixed(4)
    } else if (sol >= 0.001) {
      return sol.toFixed(6)
    } else {
      return sol.toFixed(9)
    }
  }

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
    formatBalance,
  }
}

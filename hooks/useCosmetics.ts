import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Cosmetic } from '@/components/store/CosmeticItem'

// Mock cosmetics data - in a real app, this would come from Supabase
const mockCosmetics: Cosmetic[] = [
  {
    id: 'bird_default',
    name: 'Default Bird',
    description: 'The classic red bird - free to use!',
    price: 0,
    rarity: 'common',
    imageUrl: '/Bird2-export.png',
    type: 'bird',
  },
  {
    id: 'bird_1',
    name: 'Classic Bird',
    description: 'The original classic bird design',
    price: 0.01,
    rarity: 'common',
    imageUrl: '/Bird1.png',
    type: 'bird',
  },
  {
    id: 'bird_3',
    name: 'Red Warrior Bird',
    description: 'A fierce red bird with warrior spirit',
    price: 0.02,
    rarity: 'common',
    imageUrl: '/Bird3.png',
    type: 'bird',
  },
  {
    id: 'bird_4',
    name: 'Green Explorer Bird',
    description: 'A bright green bird ready for adventure',
    price: 0.03,
    rarity: 'rare',
    imageUrl: '/Bird4.png',
    type: 'bird',
  },
  {
    id: 'bird_5',
    name: 'Brown Ranger Bird',
    description: 'A sturdy brown bird for long flights',
    price: 0.04,
    rarity: 'rare',
    imageUrl: '/Bird5.png',
    type: 'bird',
  },
  {
    id: 'bird_6',
    name: 'White Angel Bird',
    description: 'A pure white bird with angelic grace',
    price: 0.05,
    rarity: 'epic',
    imageUrl: '/Bird6.png',
    type: 'bird',
  },
  {
    id: 'bird_7',
    name: 'Purple Mystic Bird',
    description: 'A mystical purple bird with magical powers',
    price: 0.08,
    rarity: 'legendary',
    imageUrl: '/Bird7.png',
    type: 'bird',
  },
  {
    id: 'bird_golden',
    name: 'Golden Bird',
    description: 'A majestic golden bird with shimmering feathers',
    price: 0.1,
    rarity: 'legendary',
    imageUrl: '',
    type: 'bird',
  },
  {
    id: 'bird_rainbow',
    name: 'Rainbow Bird',
    description: 'A colorful bird with rainbow plumage',
    price: 0.05,
    rarity: 'epic',
    imageUrl: '',
    type: 'bird',
  },
  {
    id: 'bird_stealth',
    name: 'Stealth Bird',
    description: 'A sleek black bird for night flying',
    price: 0.03,
    rarity: 'rare',
    imageUrl: '',
    type: 'bird',
  },
  {
    id: 'background_sunset',
    name: 'Sunset Background',
    description: 'Beautiful sunset sky background',
    price: 0.02,
    rarity: 'common',
    imageUrl: '',
    type: 'background',
  },
  {
    id: 'effect_sparkles',
    name: 'Sparkle Effect',
    description: 'Adds sparkles when scoring points',
    price: 0.04,
    rarity: 'rare',
    imageUrl: '',
    type: 'effect',
  },
  {
    id: 'pipe_4',
    name: 'Damaged Pipe',
    description: 'A damaged pipe with blood stains',
    price: 0.02,
    rarity: 'common',
    imageUrl: '/Sprite-0004.png',
    type: 'pipe',
  },
  {
    id: 'pipe_5',
    name: 'Target Pipe',
    description: 'A pipe with target markings',
    price: 0.03,
    rarity: 'rare',
    imageUrl: '/Sprite-0005.png',
    type: 'pipe',
  },
  {
    id: 'pipe_6',
    name: 'Cracked Pipe',
    description: 'A heavily cracked and damaged pipe',
    price: 0.04,
    rarity: 'rare',
    imageUrl: '/Sprite-0006.png',
    type: 'pipe',
  },
  {
    id: 'pipe_7',
    name: 'Rusty Pipe',
    description: 'An old rusty pipe with corrosion',
    price: 0.05,
    rarity: 'epic',
    imageUrl: '/Sprite-0007.png',
    type: 'pipe',
  },
]

export const useCosmetics = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [cosmetics] = useState<Cosmetic[]>(mockCosmetics)

  const purchaseCosmetic = async (cosmeticId: string, price: number) => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected')
    }

    try {
      // Create transaction to send SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // Replace with your treasury address
          lamports: price * LAMPORTS_PER_SOL,
        })
      )

      // Send transaction
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      // Save cosmetic ownership to localStorage (can be replaced with Supabase)
      const userCosmetics = getUserCosmeticsFromStorage(publicKey.toString())
      if (!userCosmetics.includes(cosmeticId)) {
        userCosmetics.push(cosmeticId)
        localStorage.setItem(`userCosmetics_${publicKey.toString()}`, JSON.stringify(userCosmetics))
      }

      console.log(`Cosmetic ${cosmeticId} purchased successfully! Transaction: ${signature}`)
      return signature
    } catch (error) {
      console.error('Purchase failed:', error)
      throw error
    }
  }

  const getUserCosmetics = async (playerAddress: string): Promise<string[]> => {
    try {
      return getUserCosmeticsFromStorage(playerAddress)
    } catch (error) {
      console.error('Failed to get user cosmetics:', error)
      return []
    }
  }

  const getUserCosmeticsFromStorage = (playerAddress: string): string[] => {
    try {
      const saved = localStorage.getItem(`userCosmetics_${playerAddress}`)
      const cosmetics = saved ? JSON.parse(saved) : []
      
      // Always include default bird if not already present
      if (!cosmetics.includes('bird_default')) {
        cosmetics.push('bird_default')
        localStorage.setItem(`userCosmetics_${playerAddress}`, JSON.stringify(cosmetics))
      }
      
      return cosmetics
    } catch (error) {
      console.error('Failed to parse user cosmetics:', error)
      return ['bird_default'] // Always return at least the default bird
    }
  }

  const isCosmeticOwned = (cosmeticId: string): boolean => {
    if (!publicKey) return false
    const userCosmetics = getUserCosmeticsFromStorage(publicKey.toString())
    return userCosmetics.includes(cosmeticId)
  }

  const selectCosmetic = async (cosmeticId: string): Promise<void> => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      // Check if user owns this cosmetic
      if (!isCosmeticOwned(cosmeticId)) {
        throw new Error('Cosmetic not owned')
      }

      // Save selected cosmetic to localStorage
      localStorage.setItem(`selectedCosmetic_${publicKey.toString()}`, cosmeticId)
      console.log(`Selected cosmetic: ${cosmeticId}`)
    } catch (error) {
      console.error('Failed to select cosmetic:', error)
      throw error
    }
  }

  const getSelectedCosmetic = (playerAddress: string): string | null => {
    try {
      const saved = localStorage.getItem(`selectedCosmetic_${playerAddress}`)
      return saved || null
    } catch (error) {
      console.error('Failed to get selected cosmetic:', error)
      return null
    }
  }

  return {
    cosmetics,
    purchaseCosmetic,
    getUserCosmetics,
    isCosmeticOwned,
    selectCosmetic,
    getSelectedCosmetic,
  }
}

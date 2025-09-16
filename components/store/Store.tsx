'use client'

import { FC, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { ShoppingCart, Coins, Lock, Check, RefreshCw } from 'lucide-react'
import { CosmeticItem } from './CosmeticItem'
import { PurchaseModal } from './PurchaseModal'
import { useCosmetics } from '@/hooks/useCosmetics'
import { useBalance } from '@/hooks/useBalance'

export const Store: FC = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { cosmetics, purchaseCosmetic, getUserCosmetics, selectCosmetic, getSelectedCosmetic } = useCosmetics()
  const { balance, isLoading: balanceLoading, formatBalance, refreshBalance, error: balanceError } = useBalance()
  const [userCosmetics, setUserCosmetics] = useState<string[]>([])
  const [selectedCosmetic, setSelectedCosmetic] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean
    itemName: string
    itemPrice: number
    cosmeticId: string
  }>({
    isOpen: false,
    itemName: '',
    itemPrice: 0,
    cosmeticId: ''
  })

  useEffect(() => {
    if (publicKey) {
      loadUserCosmetics()
      loadSelectedCosmetic()
    }
  }, [publicKey])

  const loadUserCosmetics = async () => {
    if (!publicKey) return
    try {
      const owned = await getUserCosmetics(publicKey.toString())
      setUserCosmetics(owned)
    } catch (error) {
      console.error('Failed to load user cosmetics:', error)
    }
  }

  const loadSelectedCosmetic = () => {
    if (!publicKey) return
    try {
      const selected = getSelectedCosmetic(publicKey.toString())
      setSelectedCosmetic(selected)
    } catch (error) {
      console.error('Failed to load selected cosmetic:', error)
    }
  }

  const handlePurchase = (cosmeticId: string, price: number) => {
    const cosmetic = cosmetics.find(c => c.id === cosmeticId)
    if (!cosmetic) return
    
    setPurchaseModal({
      isOpen: true,
      itemName: cosmetic.name,
      itemPrice: price,
      cosmeticId: cosmeticId
    })
  }

  const handlePurchaseSuccess = async () => {
    try {
      // Mark cosmetic as purchased in local storage
      await purchaseCosmetic(purchaseModal.cosmeticId, purchaseModal.itemPrice)
      await loadUserCosmetics()
      // Refresh balance after successful purchase
      refreshBalance()
      
      // Close modal
      setPurchaseModal({
        isOpen: false,
        itemName: '',
        itemPrice: 0,
        cosmeticId: ''
      })
    } catch (error) {
      console.error('Failed to update cosmetic ownership:', error)
    }
  }

  const closePurchaseModal = () => {
    setPurchaseModal({
      isOpen: false,
      itemName: '',
      itemPrice: 0,
      cosmeticId: ''
    })
  }

  const handleUseCosmetic = async (cosmeticId: string) => {
    if (!publicKey) return
    
    try {
      await selectCosmetic(cosmeticId)
      setSelectedCosmetic(cosmeticId)
      console.log(`Selected cosmetic: ${cosmeticId}`)
    } catch (error) {
      console.error('Failed to select cosmetic:', error)
    }
  }

  const ownedCosmetics = cosmetics.filter(cosmetic => 
    userCosmetics.includes(cosmetic.id)
  )

  const availableCosmetics = cosmetics.filter(cosmetic => 
    !userCosmetics.includes(cosmetic.id)
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
            <ShoppingCart className="w-10 h-10 text-secondary-500" />
            <span>Cosmetic Store</span>
          </h1>
          <p className="text-white/60 mt-2">
            Unlock new bird skins and accessories with SOL
          </p>
        </div>
        
        <div className="text-right">
          {publicKey ? (
            <>
              <div className="flex items-center space-x-2 text-white">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold">
                  {balanceLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : balance !== null ? (
                    `${formatBalance(balance)} SOL`
                  ) : (
                    '0.0000 SOL'
                  )}
                </span>
                <button
                  onClick={refreshBalance}
                  disabled={balanceLoading}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-white/60 text-sm">Available Balance</p>
              <p className="text-white/40 text-xs">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </p>
              {balanceError && (
                <p className="text-red-400 text-xs mt-1">
                  Error: {balanceError}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-white/60">
                <Coins className="w-5 h-5" />
                <span className="text-lg font-semibold">0.0000 SOL</span>
              </div>
              <p className="text-white/60 text-sm">Connect wallet to see balance</p>
            </>
          )}
        </div>
      </div>

      {/* Wallet Connection Notice */}
      {!publicKey && (
        <div className="card text-center">
          <Lock className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-white/60">
            Connect your Solana wallet to purchase cosmetics and unlock new bird skins!
          </p>
        </div>
      )}

      {/* Owned Cosmetics */}
      {ownedCosmetics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Check className="w-6 h-6 text-green-400" />
            <span>Your Collection</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedCosmetics.map((cosmetic) => (
              <CosmeticItem
                key={cosmetic.id}
                cosmetic={cosmetic}
                isOwned={true}
                onPurchase={() => {}}
                onUse={() => handleUseCosmetic(cosmetic.id)}
                isLoading={false}
                isSelected={selectedCosmetic === cosmetic.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Cosmetics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Available Cosmetics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCosmetics.map((cosmetic) => (
            <CosmeticItem
              key={cosmetic.id}
              cosmetic={cosmetic}
              isOwned={false}
              onPurchase={() => handlePurchase(cosmetic.id, cosmetic.price)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={closePurchaseModal}
        itemName={purchaseModal.itemName}
        itemPrice={purchaseModal.itemPrice}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      {/* Back Button */}
      {/* Back to Menu button removed */}
    </div>
  )
}

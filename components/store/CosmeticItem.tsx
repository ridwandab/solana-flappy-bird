'use client'

import { FC } from 'react'
import { Coins, Check, Lock } from 'lucide-react'

export interface Cosmetic {
  id: string
  name: string
  description: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  imageUrl: string
  type: 'bird' | 'background' | 'effect'
}

interface CosmeticItemProps {
  cosmetic: Cosmetic
  isOwned: boolean
  onPurchase: () => void
  isLoading: boolean
}

const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
}

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
}

export const CosmeticItem: FC<CosmeticItemProps> = ({
  cosmetic,
  isOwned,
  onPurchase,
  isLoading,
}) => {
  return (
    <div className={`card relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      isOwned ? 'ring-2 ring-green-400' : `ring-1 ${rarityBorders[cosmetic.rarity]}`
    }`}>
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm ${
        rarityColors[cosmetic.rarity]
      }`}>
        {cosmetic.rarity.toUpperCase()}
      </div>

      {/* Cosmetic Image */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
        {cosmetic.imageUrl ? (
          <img
            src={cosmetic.imageUrl}
            alt={cosmetic.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-4xl text-white/40">
            {cosmetic.type === 'bird' ? '🐦' : cosmetic.type === 'background' ? '🌅' : '✨'}
          </div>
        )}
      </div>

      {/* Cosmetic Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">{cosmetic.name}</h3>
        <p className="text-sm text-white/60">{cosmetic.description}</p>
        
        {/* Price or Owned Status */}
        <div className="flex items-center justify-between">
          {isOwned ? (
            <div className="flex items-center space-x-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Owned</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-yellow-400">
              <Coins className="w-5 h-5" />
              <span className="font-semibold">{cosmetic.price} SOL</span>
            </div>
          )}
        </div>

        {/* Purchase Button */}
        {!isOwned && (
          <button
            onClick={onPurchase}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
              isLoading
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isLoading ? 'Processing...' : 'Purchase'}
          </button>
        )}
      </div>

      {/* Type Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm text-white/80">
        {cosmetic.type}
      </div>
    </div>
  )
}

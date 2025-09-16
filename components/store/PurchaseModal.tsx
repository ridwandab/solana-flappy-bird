'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { X, ShoppingCart, Wallet, ExternalLink } from 'lucide-react'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  itemPrice: number // Price in SOL
  onPurchaseSuccess?: () => void
}

const MERCHANT_WALLET = '87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG'

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemPrice,
  onPurchaseSuccess
}) => {
  const { publicKey, sendTransaction, connected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePurchase = async () => {
    if (!publicKey || !sendTransaction) {
      setError('Please connect your wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create connection to Solana network
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
      
      // Create transaction
      const transaction = new Transaction()
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(MERCHANT_WALLET),
        lamports: itemPrice * LAMPORTS_PER_SOL, // Convert SOL to lamports
      })
      
      transaction.add(transferInstruction)
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection)
      setTransactionSignature(signature)
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')
      
      console.log('Purchase successful!', signature)
      onPurchaseSuccess?.()
      
    } catch (err: any) {
      console.error('Purchase failed:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price} SOL`
  }

  const getExplorerUrl = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Purchase {itemName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Purchase Details */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Item:</span>
              <span className="font-semibold">{itemName}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold text-green-600">{formatPrice(itemPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Merchant:</span>
              <span className="font-mono text-xs text-gray-500">
                {MERCHANT_WALLET.slice(0, 8)}...{MERCHANT_WALLET.slice(-8)}
              </span>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">
              {connected ? (
                <span className="text-green-600">Wallet Connected</span>
              ) : (
                <span className="text-red-600">Please connect your wallet</span>
              )}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {transactionSignature && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-600 text-sm mb-2">Purchase successful!</p>
            <a
              href={getExplorerUrl(transactionSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              View on Solana Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!connected || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Pay {formatPrice(itemPrice)}
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Payment will be sent to the merchant wallet</p>
          <p>Transaction will be confirmed on Solana blockchain</p>
        </div>
      </div>
    </div>
  )
}

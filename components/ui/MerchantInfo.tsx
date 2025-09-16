'use client'

import React from 'react'
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const MERCHANT_WALLET = '87cVj6FenLmab1nniKBa8NEGg7kJ3fFkKpJTD5PgWbBG'

export const MerchantInfo: React.FC = () => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(MERCHANT_WALLET)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getExplorerUrl = () => {
    return `https://explorer.solana.com/address/${MERCHANT_WALLET}`
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center gap-3 mb-3">
        <Wallet className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Merchant Wallet</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Address:</span>
          <code className="text-blue-300 text-sm font-mono bg-black/20 px-2 py-1 rounded">
            {MERCHANT_WALLET.slice(0, 8)}...{MERCHANT_WALLET.slice(-8)}
          </code>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
          
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Explorer
          </a>
        </div>
        
        <p className="text-white/50 text-xs">
          All purchases will be sent to this wallet address
        </p>
      </div>
    </div>
  )
}

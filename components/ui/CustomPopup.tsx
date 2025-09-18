'use client'

import { FC, useEffect, useState } from 'react'
import { CheckCircle, X, Trophy, Coins, Star } from 'lucide-react'

interface CustomPopupProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

export const CustomPopup: FC<CustomPopupProps> = ({ 
  message, 
  type = 'success', 
  duration = 2000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Show popup with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true)
      setIsAnimating(true)
    }, 100)

    // Hide popup after duration
    const hideTimer = setTimeout(() => {
      setIsAnimating(false)
      setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, 300) // Wait for exit animation
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'error':
        return <X className="w-8 h-8 text-red-400" />
      case 'warning':
        return <Star className="w-8 h-8 text-yellow-400" />
      case 'info':
        return <Coins className="w-8 h-8 text-blue-400" />
      default:
        return <Trophy className="w-8 h-8 text-yellow-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30'
      case 'error':
        return 'bg-red-500/20 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30'
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30'
      default:
        return 'bg-purple-500/20 border-purple-500/30'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Popup */}
      <div 
        className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl max-w-sm mx-4 pointer-events-auto transform transition-all duration-300 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Content */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-lg">
              {message}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-${duration} ease-linear ${
              isAnimating ? 'w-full' : 'w-0'
            }`}
            style={{
              animation: isAnimating ? `shrink ${duration}ms linear forwards` : 'none'
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Hook untuk menggunakan custom popup
export const useCustomPopup = () => {
  const [popup, setPopup] = useState<{
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
  } | null>(null)

  const showPopup = (
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration: number = 2000
  ) => {
    setPopup({ message, type, duration })
  }

  const hidePopup = () => {
    setPopup(null)
  }

  const PopupComponent = popup ? (
    <CustomPopup
      message={popup.message}
      type={popup.type}
      duration={popup.duration}
      onClose={hidePopup}
    />
  ) : null

  return {
    showPopup,
    hidePopup,
    PopupComponent
  }
}

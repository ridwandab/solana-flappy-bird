'use client'

import { useEffect } from 'react'
import { useGlobalAudio } from '@/hooks/useGlobalAudio'

interface AudioInitializerProps {
  children: React.ReactNode
}

export const AudioInitializer: React.FC<AudioInitializerProps> = ({ children }) => {
  const { startMusicImmediately } = useGlobalAudio()

  // Auto-start background music when component mounts
  useEffect(() => {
    const autoStartMusic = async () => {
      try {
        await startMusicImmediately()
        console.log('🎵 Auto-start music attempted on website load')
      } catch (error) {
        console.log('🎵 Auto-start music failed, will start on user interaction:', error)
      }
    }

    // Small delay to ensure everything is loaded
    const timer = setTimeout(autoStartMusic, 1000)
    
    return () => clearTimeout(timer)
  }, [startMusicImmediately])

  return <>{children}</>
}

'use client'

import { useEffect } from 'react'
import { useGlobalAudio } from '@/hooks/useGlobalAudio'

interface AudioInitializerProps {
  children: React.ReactNode
}

export const AudioInitializer: React.FC<AudioInitializerProps> = ({ children }) => {
  const { resumeAudioContext } = useGlobalAudio()

  // Initialize audio context for sound effects
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await resumeAudioContext()
        console.log('🔊 Audio context initialized for sound effects')
      } catch (error) {
        console.log('🔊 Audio context initialization failed:', error)
      }
    }

    // Small delay to ensure everything is loaded
    const timer = setTimeout(initializeAudio, 1000)
    
    return () => clearTimeout(timer)
  }, [resumeAudioContext])

  return <>{children}</>
}

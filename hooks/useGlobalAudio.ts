import { useEffect, useRef } from 'react'
import { useSettings } from './useSettings'

export const useGlobalAudio = () => {
  const { settings } = useSettings()
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicLoopRef = useRef<any>(null)
  const isPlayingRef = useRef(false)
  const currentGainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('Global audio context initialized')
      } catch (error) {
        console.error('Failed to initialize global audio context:', error)
      }
    }
  }, [])

  // Background music disabled - only sound effects enabled

  useEffect(() => {
    // Update sound effects based on settings
    console.log('Sound effects enabled:', settings.soundEnabled)
    if (!settings.soundEnabled) {
      console.log('Sound effects disabled globally')
    }
  }, [settings.soundEnabled])

  // Background music disabled - no volume control needed

  // Background music functions removed - only sound effects enabled

  const resumeAudioContext = async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
        console.log('Audio context resumed')
        return true
      } catch (error) {
        console.error('Failed to resume audio context:', error)
        return false
      }
    }
    return true
  }

  return {
    resumeAudioContext,
    isPlaying: false // Always false since no background music
  }
}

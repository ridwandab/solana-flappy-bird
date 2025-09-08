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

  useEffect(() => {
    // Update music based on settings
    if (settings.musicEnabled && !isPlayingRef.current) {
      startBackgroundMusic()
    } else if (!settings.musicEnabled && isPlayingRef.current) {
      stopBackgroundMusic()
    }
  }, [settings.musicEnabled])

  useEffect(() => {
    // Update sound effects based on settings
    console.log('Sound effects enabled:', settings.soundEnabled)
    if (!settings.soundEnabled) {
      console.log('Sound effects disabled globally')
    }
  }, [settings.soundEnabled])

  useEffect(() => {
    // Update volume in real-time
    if (currentGainNodeRef.current && audioContextRef.current) {
      const volume = (settings.musicVolume / 100) * 0.1 // Max 10% volume
      currentGainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
      console.log('Music volume updated to:', settings.musicVolume + '%')
    }
  }, [settings.musicVolume])

  const createBackgroundMusicLoop = () => {
    if (!audioContextRef.current) return null

    const audioContext = audioContextRef.current
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    const filter = audioContext.createBiquadFilter()
    
    // Connect nodes
    oscillator1.connect(filter)
    oscillator2.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configure oscillators for 8-bit style
    oscillator1.type = 'square'
    oscillator1.frequency.setValueAtTime(220, audioContext.currentTime) // A3
    oscillator1.frequency.setValueAtTime(277, audioContext.currentTime + 0.5) // C#4
    oscillator1.frequency.setValueAtTime(330, audioContext.currentTime + 1) // E4
    oscillator1.frequency.setValueAtTime(277, audioContext.currentTime + 1.5) // C#4
    
    oscillator2.type = 'square'
    oscillator2.frequency.setValueAtTime(110, audioContext.currentTime) // A2 (octave lower)
    oscillator2.frequency.setValueAtTime(138, audioContext.currentTime + 0.5) // C#3
    oscillator2.frequency.setValueAtTime(165, audioContext.currentTime + 1) // E3
    oscillator2.frequency.setValueAtTime(138, audioContext.currentTime + 1.5) // C#3
    
    // Configure filter for 8-bit sound
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, audioContext.currentTime)
    
    // Configure gain based on settings
    const volume = (settings.musicVolume / 100) * 0.1 // Max 10% volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    
    // Store reference to current gain node for volume control
    currentGainNodeRef.current = gainNode
    
    return { oscillator1, oscillator2, gainNode, filter }
  }

  const startBackgroundMusic = () => {
    if (!audioContextRef.current || isPlayingRef.current) return

    isPlayingRef.current = true
    console.log('Starting global background music')

    const playLoop = () => {
      if (isPlayingRef.current && audioContextRef.current) {
        musicLoopRef.current = createBackgroundMusicLoop()
        if (musicLoopRef.current) {
          musicLoopRef.current.oscillator1.start()
          musicLoopRef.current.oscillator2.start()
          musicLoopRef.current.oscillator1.stop(audioContextRef.current.currentTime + 2)
          musicLoopRef.current.oscillator2.stop(audioContextRef.current.currentTime + 2)
        }
        
        // Schedule next loop
        setTimeout(() => {
          if (isPlayingRef.current) {
            playLoop()
          }
        }, 2000)
      }
    }

    playLoop()
  }

  const stopBackgroundMusic = () => {
    isPlayingRef.current = false
    console.log('Stopping global background music')
    
    if (musicLoopRef.current) {
      try {
        musicLoopRef.current.oscillator1.stop()
        musicLoopRef.current.oscillator2.stop()
      } catch (e) {
        // Oscillators might already be stopped
      }
    }
  }

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

  const startMusicImmediately = async () => {
    try {
      // Try to resume audio context first
      const resumed = await resumeAudioContext()
      
      // Start music if enabled and not already playing
      if (settings.musicEnabled && !isPlayingRef.current && resumed) {
        startBackgroundMusic()
        console.log('🎵 Music started immediately on website load')
        return true
      }
      return false
    } catch (error) {
      console.log('🎵 Cannot start music immediately, needs user interaction:', error)
      return false
    }
  }

  return {
    startBackgroundMusic,
    stopBackgroundMusic,
    resumeAudioContext,
    startMusicImmediately,
    isPlaying: isPlayingRef.current
  }
}

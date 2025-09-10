import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGlobalAudio } from './useGlobalAudio'

export interface GameSettings {
  // Audio Settings
  soundEnabled: boolean
  soundVolume: number
  
  // Graphics Settings
  graphicsQuality: 'low' | 'medium' | 'high'
  showFPS: boolean
  
  // Gameplay Settings
  autoSave: boolean
  notifications: boolean
  
  // Language Settings
  language: 'en' | 'id'
  
  // Game Physics Settings
  gravity: number
  flapForce: number
  pipeSpeed: number
  pipeSpawnDelay: number
  
  // Privacy Settings
  showOnLeaderboard: boolean
  allowFriendRequests: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  // Audio Settings
  soundEnabled: true,
  soundVolume: 70,
  
  // Graphics Settings
  graphicsQuality: 'high',
  showFPS: false,
  
  // Gameplay Settings
  autoSave: true,
  notifications: true,
  
  // Language Settings
  language: 'en',
  
  // Game Physics Settings
  gravity: 30,  // Extremely low gravity for very easy control
  flapForce: -350,  // Moderate flap force for smooth jumping
  pipeSpeed: 3,
  pipeSpawnDelay: 3000,
  
  // Privacy Settings
  showOnLeaderboard: true,
  allowFriendRequests: true
}

export const useSettings = () => {
  const { publicKey } = useWallet()
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [publicKey])

  // Update audio system when settings change
  useEffect(() => {
    // This will trigger useGlobalAudio to update volume
    console.log('Settings changed, audio system will be updated:', {
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume
    })
  }, [settings.soundEnabled, settings.soundVolume])

  const loadSettings = () => {
    try {
      const key = publicKey ? `settings_${publicKey.toString()}` : 'settings_anonymous'
      const saved = localStorage.getItem(key)
      
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...DEFAULT_SETTINGS, ...parsed }))
        console.log('Settings loaded:', parsed)
      } else {
        console.log('No saved settings found, using defaults')
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setSettings(DEFAULT_SETTINGS)
    }
  }

  const saveSettings = async (newSettings: GameSettings) => {
    setIsLoading(true)
    try {
      const key = publicKey ? `settings_${publicKey.toString()}` : 'settings_anonymous'
      localStorage.setItem(key, JSON.stringify(newSettings))
      setSettings(newSettings)
      console.log('Settings saved:', newSettings)
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: keyof GameSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    return await saveSettings(newSettings)
  }

  const resetSettings = async () => {
    return await saveSettings(DEFAULT_SETTINGS)
  }

  const getGamePhysicsConfig = () => {
    return {
      gravity: settings.gravity,
      flapForce: settings.flapForce,
      pipeSpeed: settings.pipeSpeed,
      pipeSpawnDelay: settings.pipeSpawnDelay
    }
  }

  const getAudioConfig = () => {
    return {
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume / 100
    }
  }

  const getGraphicsConfig = () => {
    return {
      quality: settings.graphicsQuality,
      showFPS: settings.showFPS
    }
  }

  return {
    settings,
    setSettings,
    isLoading,
    saveSettings,
    updateSetting,
    resetSettings,
    loadSettings,
    getGamePhysicsConfig,
    getAudioConfig,
    getGraphicsConfig
  }
}

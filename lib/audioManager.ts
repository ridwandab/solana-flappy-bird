import * as Phaser from 'phaser'

export interface AudioConfig {
  soundEnabled: boolean
  soundVolume: number
}

export class AudioManager {
  private scene: Phaser.Scene
  private config: AudioConfig
  private backgroundMusic: Phaser.Sound.BaseSound | null = null
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map()
  private soundEnabled: boolean = true

  constructor(scene: Phaser.Scene, config: AudioConfig) {
    this.scene = scene
    this.config = config
    this.initializeAudio()
  }

  private async initializeAudio() {
    try {
      // Load background music
      await this.loadBackgroundMusic()
      
      // Load sound effects
      await this.loadSoundEffects()
      
      console.log('Audio system initialized successfully')
    } catch (error) {
      console.error('Failed to initialize audio system:', error)
    }
  }

  private async loadBackgroundMusic() {
    // Background music disabled - only sound effects enabled
    console.log('Background music disabled - only sound effects enabled')
  }

  private async loadSoundEffects() {
    try {
      // Create sound effects using Web Audio API
      this.sounds.set('flap', this.createFlapSound())
      this.sounds.set('score', this.createScoreSound())
      this.sounds.set('gameOver', this.createGameOverSound())

      console.log('Sound effects loaded with Web Audio API')
    } catch (error) {
      console.error('Failed to load sound effects:', error)
    }
  }

  private createFlapSound() {
    return {
      play: () => {
        if (this.soundEnabled) {
          this.playFlapSoundEffect()
        }
      }
    } as any
  }

  private createScoreSound() {
    return {
      play: () => {
        if (this.soundEnabled) {
          this.playScoreSoundEffect()
        }
      }
    } as any
  }

  private createGameOverSound() {
    return {
      play: () => {
        if (this.soundEnabled) {
          this.playGameOverSoundEffect()
        }
      }
    } as any
  }

  private playFlapSoundEffect() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
      
      const volume = (this.config.soundVolume / 100) * 0.3
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Flap sound effect failed:', error)
    }
  }

  private playScoreSoundEffect() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
      
      const volume = (this.config.soundVolume / 100) * 0.2
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Score sound effect failed:', error)
    }
  }

  private playGameOverSoundEffect() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5)
      
      const volume = (this.config.soundVolume / 100) * 0.4
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Game over sound effect failed:', error)
    }
  }

  private createPlaceholderSound(name: string) {
    return {
      play: () => {
        if (this.soundEnabled) {
          console.log(`Playing ${name} sound (placeholder)`)
        } else {
          console.log(`${name} sound disabled (placeholder)`)
        }
      }
    } as any
  }

  public updateConfig(newConfig: AudioConfig) {
    this.config = newConfig
    
    // Update Phaser sound system volume
    if (this.scene.sound) {
      this.scene.sound.volume = newConfig.soundVolume / 100
      this.scene.sound.mute = !newConfig.soundEnabled
      console.log('Phaser sound system volume updated to:', newConfig.soundVolume + '%')
      console.log('Phaser sound system mute:', !newConfig.soundEnabled)
    }
    
  }

  public startBackgroundMusic() {
    // Background music disabled - only sound effects enabled
    console.log('Background music disabled - only sound effects enabled')
  }

  public stopBackgroundMusic() {
    // Background music disabled - only sound effects enabled
    console.log('Background music disabled - only sound effects enabled')
  }

  public playSound(soundName: string) {
    const sound = this.sounds.get(soundName)
    if (sound && this.soundEnabled) {
      sound.play()
      console.log(`Playing sound: ${soundName}`)
    } else if (!this.soundEnabled) {
      console.log(`Sound disabled, not playing: ${soundName}`)
    }
  }

  public playFlapSound() {
    this.playSound('flap')
  }

  public playScoreSound() {
    this.playSound('score')
  }

  public playGameOverSound() {
    this.playSound('gameOver')
  }

  public updateAudioConfig(newConfig: AudioConfig) {
    console.log('Updating audio config:', newConfig)
    this.config = newConfig
    
    // Background music disabled - only sound effects enabled
    console.log('Background music disabled - only sound effects enabled')
    
    // Update sound effects enabled state
    this.soundEnabled = newConfig.soundEnabled
    console.log(`Sound effects ${newConfig.soundEnabled ? 'enabled' : 'disabled'}`)
    
    // Update sound volumes (for future use when we have actual sound files)
    this.sounds.forEach((sound, name) => {
      if (sound && 'volume' in sound) {
        (sound as any).volume = newConfig.soundVolume / 100
      }
    })
    
    console.log('Audio config updated successfully')
  }

  public getCurrentConfig(): AudioConfig {
    return { ...this.config }
  }
}

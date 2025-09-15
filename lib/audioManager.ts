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
  private audioContext: AudioContext | null = null
  private audioContextInitialized: boolean = false

  constructor(scene: Phaser.Scene, config: AudioConfig) {
    this.scene = scene
    this.config = config
    this.initializeAudio()
  }

  private async initializeAudio() {
    try {
      // Initialize AudioContext (but don't start it yet)
      this.initializeAudioContext()
      
      // Load background music
      await this.loadBackgroundMusic()
      
      // Load sound effects
      await this.loadSoundEffects()
      
      console.log('Audio system initialized successfully')
    } catch (error) {
      console.error('Failed to initialize audio system:', error)
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('AudioContext created (suspended state)')
    } catch (error) {
      console.error('Failed to create AudioContext:', error)
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
        this.audioContextInitialized = true
        console.log('AudioContext resumed successfully')
      } catch (error) {
        console.error('Failed to resume AudioContext:', error)
      }
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

  private async playFlapSoundEffect() {
    try {
      if (!this.audioContext) return
      
      // Resume AudioContext if needed
      await this.resumeAudioContext()
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)
      
      const volume = (this.config.soundVolume / 100) * 0.3
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
      
      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Flap sound effect failed:', error)
    }
  }

  private async playScoreSoundEffect() {
    try {
      if (!this.audioContext) return
      
      // Resume AudioContext if needed
      await this.resumeAudioContext()
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2) // G5
      
      const volume = (this.config.soundVolume / 100) * 0.2
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
      
      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Score sound effect failed:', error)
    }
  }

  private async playGameOverSoundEffect() {
    try {
      if (!this.audioContext) return
      
      // Resume AudioContext if needed
      await this.resumeAudioContext()
      
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5)
      
      const volume = (this.config.soundVolume / 100) * 0.4
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + 0.5)
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

  public async initializeAudioOnUserGesture() {
    console.log('Initializing audio on user gesture...')
    await this.resumeAudioContext()
  }
}

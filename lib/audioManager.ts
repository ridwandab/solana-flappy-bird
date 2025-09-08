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
      // Create sound effects using Phaser sound system for easier volume control
      const flapSound = this.scene.sound.add('flap_sound', {
        volume: this.config.soundVolume / 100
      })
      
      const scoreSound = this.scene.sound.add('score_sound', {
        volume: this.config.soundVolume / 100
      })
      
      const gameOverSound = this.scene.sound.add('game_over_sound', {
        volume: this.config.soundVolume / 100
      })

      // Store sound effects (with fallback if sounds don't exist)
      this.sounds.set('flap', flapSound || this.createPlaceholderSound('flap'))
      this.sounds.set('score', scoreSound || this.createPlaceholderSound('score'))
      this.sounds.set('gameOver', gameOverSound || this.createPlaceholderSound('gameOver'))

      console.log('Sound effects loaded')
    } catch (error) {
      console.error('Failed to load sound effects:', error)
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

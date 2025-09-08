import * as Phaser from 'phaser'

export interface AudioConfig {
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
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
    try {
      // Create background music using Phaser sound system for easier volume control
      this.backgroundMusic = this.scene.sound.add('background_music', {
        volume: this.config.musicVolume / 100,
        loop: true
      })
      
      console.log('Background music loaded with Phaser sound system')

      console.log('Background music loaded')
    } catch (error) {
      console.error('Failed to load background music:', error)
    }
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

      // Store sound effects
      this.sounds.set('flap', flapSound)
      this.sounds.set('score', scoreSound)
      this.sounds.set('gameOver', gameOverSound)

      console.log('Sound effects loaded')
    } catch (error) {
      console.error('Failed to load sound effects:', error)
    }
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
    
    // Update background music volume in real-time
    if (this.backgroundMusic) {
      // Update mute state
      if (newConfig.musicEnabled) {
        this.backgroundMusic.resume()
        console.log('Background music resumed, volume:', newConfig.musicVolume + '%')
      } else {
        this.backgroundMusic.pause()
        console.log('Background music paused')
      }
    }
    
    // Store sound enabled state for use in play methods
    this.soundEnabled = newConfig.soundEnabled
    
    console.log('Audio config updated:', newConfig)
  }

  public playBackgroundMusic() {
    if (this.backgroundMusic && this.config.musicEnabled) {
      this.backgroundMusic.play()
    }
  }

  public stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop()
    }
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
}

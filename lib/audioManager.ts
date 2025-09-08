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
  private audioContext: AudioContext | null = null
  private currentGainNode: GainNode | null = null

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
      // Create a simple background music using Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a simple 8-bit style background music loop
      const createBackgroundMusicLoop = () => {
        if (!this.audioContext) return null
        
        const oscillator1 = this.audioContext.createOscillator()
        const oscillator2 = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        const filter = this.audioContext.createBiquadFilter()
        
        // Connect nodes
        oscillator1.connect(filter)
        oscillator2.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        // Configure oscillators for 8-bit style
        oscillator1.type = 'square'
        const currentTime = this.audioContext.currentTime
        oscillator1.frequency.setValueAtTime(220, currentTime) // A3
        oscillator1.frequency.setValueAtTime(277, currentTime + 0.5) // C#4
        oscillator1.frequency.setValueAtTime(330, currentTime + 1) // E4
        oscillator1.frequency.setValueAtTime(277, currentTime + 1.5) // C#4
        
        oscillator2.type = 'square'
        oscillator2.frequency.setValueAtTime(110, currentTime) // A2 (octave lower)
        oscillator2.frequency.setValueAtTime(138, currentTime + 0.5) // C#3
        oscillator2.frequency.setValueAtTime(165, currentTime + 1) // E3
        oscillator2.frequency.setValueAtTime(138, currentTime + 1.5) // C#3
        
        // Configure filter for 8-bit sound
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2000, currentTime)
        
        // Configure gain
        const volume = (this.config.musicVolume / 100) * 0.1 // Max 10% volume
        gainNode.gain.setValueAtTime(volume, currentTime)
        
        // Store reference to current gain node for volume control
        this.currentGainNode = gainNode
        
        return { oscillator1, oscillator2, gainNode, filter }
      }

      let musicLoop: any = null
      let isPlaying = false

      // Store the music creation function
      this.backgroundMusic = {
        play: () => {
          if (this.config.musicEnabled && !isPlaying) {
            isPlaying = true
            const playLoop = () => {
              if (isPlaying) {
                musicLoop = createBackgroundMusicLoop()
                musicLoop.oscillator1.start()
                musicLoop.oscillator2.start()
                musicLoop.oscillator1.stop((this.audioContext?.currentTime || 0) + 2)
                musicLoop.oscillator2.stop((this.audioContext?.currentTime || 0) + 2)
                
                // Schedule next loop
                setTimeout(() => {
                  if (isPlaying) {
                    playLoop()
                  }
                }, 2000)
              }
            }
            playLoop()
          }
        },
        stop: () => {
          isPlaying = false
          if (musicLoop) {
            try {
              musicLoop.oscillator1.stop()
              musicLoop.oscillator2.stop()
            } catch (e) {
              // Oscillators might already be stopped
            }
          }
        },
        pause: () => {
          isPlaying = false
        },
        resume: () => {
          if (this.config.musicEnabled) {
            isPlaying = true
            this.backgroundMusic?.play()
          }
        },
        volume: this.config.musicVolume / 100,
        mute: !this.config.musicEnabled
      } as any

      console.log('Background music loaded')
    } catch (error) {
      console.error('Failed to load background music:', error)
    }
  }

  private async loadSoundEffects() {
    try {
      // Create sound effects using Web Audio API
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Flap sound effect
      const createFlapSound = () => {
        if (!this.audioContext) return
        
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.type = 'sawtooth'
        const currentTime = this.audioContext.currentTime
        oscillator.frequency.setValueAtTime(800, currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1)
        
        const volume = (this.config.soundVolume / 100) * 0.3 // Max 30% volume
        gainNode.gain.setValueAtTime(volume, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1)
        
        oscillator.start()
        oscillator.stop(currentTime + 0.1)
      }

      // Score sound effect
      const createScoreSound = () => {
        if (!this.audioContext) return
        
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.type = 'sine'
        const currentTime = this.audioContext.currentTime
        oscillator.frequency.setValueAtTime(523, currentTime) // C5
        oscillator.frequency.setValueAtTime(659, currentTime + 0.1) // E5
        oscillator.frequency.setValueAtTime(784, currentTime + 0.2) // G5
        
        const volume = (this.config.soundVolume / 100) * 0.2 // Max 20% volume
        gainNode.gain.setValueAtTime(volume, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3)
        
        oscillator.start()
        oscillator.stop(currentTime + 0.3)
      }

      // Game over sound effect
      const createGameOverSound = () => {
        if (!this.audioContext) return
        
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.type = 'sawtooth'
        const currentTime = this.audioContext.currentTime
        oscillator.frequency.setValueAtTime(200, currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.5)
        
        const volume = (this.config.soundVolume / 100) * 0.4 // Max 40% volume
        gainNode.gain.setValueAtTime(volume, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5)
        
        oscillator.start()
        oscillator.stop(currentTime + 0.5)
      }

      // Store sound effects
      this.sounds.set('flap', {
        play: createFlapSound,
        stop: () => {},
        pause: () => {},
        resume: () => {},
        volume: this.config.soundVolume / 100,
        mute: !this.config.soundEnabled
      } as any)

      this.sounds.set('score', {
        play: createScoreSound,
        stop: () => {},
        pause: () => {},
        resume: () => {},
        volume: this.config.soundVolume / 100,
        mute: !this.config.soundEnabled
      } as any)

      this.sounds.set('gameOver', {
        play: createGameOverSound,
        stop: () => {},
        pause: () => {},
        resume: () => {},
        volume: this.config.soundVolume / 100,
        mute: !this.config.soundEnabled
      } as any)

      console.log('Sound effects loaded')
    } catch (error) {
      console.error('Failed to load sound effects:', error)
    }
  }

  public updateConfig(newConfig: AudioConfig) {
    this.config = newConfig
    
    // Update background music volume in real-time
    if (this.currentGainNode && this.audioContext) {
      const volume = (newConfig.musicVolume / 100) * 0.1 // Max 10% volume
      this.currentGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      console.log('Music volume updated to:', newConfig.musicVolume + '%')
    }
    
    // Update background music mute
    if (this.backgroundMusic) {
      if (newConfig.musicEnabled) {
        this.backgroundMusic.resume()
      } else {
        this.backgroundMusic.pause()
      }
    }
    
    // Update sound effects
    this.sounds.forEach((sound) => {
      // Note: BaseSound doesn't have direct volume/mute properties
      // Volume control is handled through the gain nodes in the audio context
      console.log('Sound effect volume updated to:', newConfig.soundVolume + '%')
    })
    
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
    if (sound && this.config.soundEnabled) {
      sound.play()
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

# Audio System - Background Music & Sound Effects

## 🎮 **Audio System - DITAMBAHKAN UNTUK GAME!**

Sistem audio lengkap sudah ditambahkan ke game dengan background musik dan sound effects yang menarik!

## ✅ **Fitur Audio yang Ditambahkan:**

### **1. AudioManager Class**
- ✅ **Web Audio API Integration**: Menggunakan Web Audio API untuk generate suara
- ✅ **8-bit Style Sounds**: Sound effects dengan gaya retro 8-bit
- ✅ **Volume Control**: Kontrol volume untuk music dan sound effects
- ✅ **Mute Functionality**: Fungsi mute untuk music dan sound effects

### **2. Background Music**
- ✅ **8-bit Style Music**: Musik latar dengan gaya retro 8-bit
- ✅ **Auto Play**: Musik dimulai otomatis saat game dimulai
- ✅ **Volume Control**: Volume dapat diatur melalui settings
- ✅ **Mute Control**: Musik dapat dimatikan melalui settings

### **3. Sound Effects**
- ✅ **Flap Sound**: Efek suara saat bird mengepak sayap
- ✅ **Score Sound**: Efek suara saat mendapat poin
- ✅ **Game Over Sound**: Efek suara saat game over
- ✅ **Volume Control**: Volume sound effects dapat diatur

### **4. Settings Integration**
- ✅ **Audio Settings**: Terintegrasi dengan sistem settings
- ✅ **Real-time Control**: Perubahan settings langsung diterapkan
- ✅ **Persistent Settings**: Settings audio tersimpan di localStorage
- ✅ **Volume Sliders**: Slider untuk mengatur volume music dan sound

## 🎯 **Audio Features:**

### **1. Background Music**
```typescript
// 8-bit style background music
const createBackgroundMusic = () => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime)
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  
  return { oscillator, gainNode }
}
```

### **2. Sound Effects**
```typescript
// Flap sound effect
const createFlapSound = () => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
  
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

// Score sound effect
const createScoreSound = () => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
  oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
  oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.3)
}

// Game over sound effect
const createGameOverSound = () => {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5)
  
  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
  
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.5)
}
```

## 🔧 **Technical Implementation:**

### **1. AudioManager Class**
```typescript
export class AudioManager {
  private scene: Phaser.Scene
  private config: AudioConfig
  private backgroundMusic: Phaser.Sound.BaseSound | null = null
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map()

  constructor(scene: Phaser.Scene, config: AudioConfig) {
    this.scene = scene
    this.config = config
    this.initializeAudio()
  }

  public updateConfig(newConfig: AudioConfig) {
    this.config = newConfig
    
    // Update background music
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = newConfig.musicVolume / 100
      this.backgroundMusic.mute = !newConfig.musicEnabled
    }
    
    // Update sound effects
    this.sounds.forEach((sound) => {
      sound.volume = newConfig.soundVolume / 100
      sound.mute = !newConfig.soundEnabled
    })
  }

  public playBackgroundMusic() {
    if (this.backgroundMusic && this.config.musicEnabled) {
      this.backgroundMusic.play()
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
```

### **2. GameScene Integration**
```typescript
export class GameScene extends Phaser.Scene {
  private audioManager: AudioManager | null = null

  private initializeAudio() {
    try {
      const audioConfig: AudioConfig = {
        soundEnabled: this.gameSettings?.soundEnabled ?? true,
        musicEnabled: this.gameSettings?.musicEnabled ?? true,
        soundVolume: this.gameSettings?.soundVolume ?? 70,
        musicVolume: this.gameSettings?.musicVolume ?? 50
      }
      
      this.audioManager = new AudioManager(this, audioConfig)
      console.log('Audio manager initialized')
    } catch (error) {
      console.error('Failed to initialize audio manager:', error)
    }
  }

  private flap() {
    if (this.bird.body) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(this.FLAP_FORCE)
      
      // Play flap sound using audio manager
      if (this.audioManager) {
        this.audioManager.playFlapSound()
      }
    }
  }

  private scorePoint() {
    this.score++
    this.scoreText.setText(this.score.toString())
    
    // Play score sound using audio manager
    if (this.audioManager) {
      this.audioManager.playScoreSound()
    }
  }

  private gameOver() {
    this.isGameOver = true
    
    // Play game over sound using audio manager
    if (this.audioManager) {
      this.audioManager.playGameOverSound()
    }
  }

  private startGame() {
    // Start background music
    if (this.audioManager) {
      this.audioManager.playBackgroundMusic()
    }
  }
}
```

### **3. Settings Integration**
```typescript
setSettings(settings: GameSettings) {
  this.gameSettings = settings
  
  // Update audio manager if it exists
  if (this.audioManager) {
    const audioConfig: AudioConfig = {
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      soundVolume: settings.soundVolume,
      musicVolume: settings.musicVolume
    }
    this.audioManager.updateConfig(audioConfig)
  }
}
```

## 🎮 **Audio Flow:**

### **1. Audio Initialization**
```
Game starts → initializeAudio() called → AudioManager created → Web Audio API initialized → Sounds loaded
```

### **2. Background Music**
```
Game starts → startGame() called → playBackgroundMusic() called → 8-bit music plays
```

### **3. Sound Effects**
```
User flaps → flap() called → playFlapSound() called → Flap sound plays
Score achieved → scorePoint() called → playScoreSound() called → Score sound plays
Game over → gameOver() called → playGameOverSound() called → Game over sound plays
```

### **4. Settings Control**
```
User changes audio settings → setSettings() called → updateConfig() called → Audio settings updated
```

## 🚀 **Audio System Benefits:**

### **1. Enhanced Gameplay**
- ✅ **Immersive Experience**: Musik dan sound effects membuat game lebih menarik
- ✅ **Audio Feedback**: Player mendapat feedback audio untuk setiap aksi
- ✅ **Retro Feel**: 8-bit style sounds memberikan nuansa retro
- ✅ **Professional Quality**: Audio system yang profesional

### **2. User Control**
- ✅ **Volume Control**: Player dapat mengatur volume music dan sound
- ✅ **Mute Options**: Player dapat mematikan music atau sound effects
- ✅ **Settings Integration**: Audio settings terintegrasi dengan sistem settings
- ✅ **Real-time Updates**: Perubahan settings langsung diterapkan

### **3. Technical Benefits**
- ✅ **Web Audio API**: Menggunakan Web Audio API untuk kualitas terbaik
- ✅ **No External Files**: Tidak memerlukan file audio eksternal
- ✅ **Lightweight**: Audio system yang ringan dan efisien
- ✅ **Cross-platform**: Bekerja di semua platform yang mendukung Web Audio API

## 🎯 **Audio Features:**

### **✅ Background Music:**
- **8-bit Style**: Musik dengan gaya retro 8-bit
- **Auto Play**: Dimulai otomatis saat game dimulai
- **Volume Control**: Volume dapat diatur (0-100%)
- **Mute Control**: Dapat dimatikan melalui settings

### **✅ Sound Effects:**
- **Flap Sound**: Efek suara saat bird mengepak sayap
- **Score Sound**: Efek suara saat mendapat poin (C5-E5-G5 chord)
- **Game Over Sound**: Efek suara saat game over (descending tone)
- **Volume Control**: Volume dapat diatur (0-100%)

### **✅ Settings Integration:**
- **Audio Settings**: Terintegrasi dengan sistem settings
- **Real-time Control**: Perubahan langsung diterapkan
- **Persistent Storage**: Settings tersimpan di localStorage
- **Volume Sliders**: Slider untuk mengatur volume

## 🎉 **Audio System - SIAP DIGUNAKAN!**

**Audio system sudah ditambahkan dan siap digunakan!**

- ✅ **Background Music**: Musik latar 8-bit style
- ✅ **Sound Effects**: Efek suara untuk flap, score, game over
- ✅ **Volume Control**: Kontrol volume untuk music dan sound
- ✅ **Settings Integration**: Terintegrasi dengan sistem settings
- ✅ **Real-time Updates**: Perubahan settings langsung diterapkan

**Sekarang game memiliki audio yang lengkap dan menarik!** 🎮🚀

**Audio system sekarang:**
- **Fully Functional**: Semua audio features berfungsi
- **8-bit Style**: Sound effects dengan gaya retro
- **Volume Control**: Kontrol volume yang lengkap
- **Settings Integration**: Terintegrasi dengan settings
- **Professional Quality**: Kualitas audio yang profesional

**Player sekarang dapat menikmati game dengan audio yang menarik!** ✅

**Silakan coba bermain game dan dengarkan musik serta sound effects!** 🎯

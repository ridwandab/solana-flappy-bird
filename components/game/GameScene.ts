import * as Phaser from 'phaser'
import { AudioManager, AudioConfig } from '@/lib/audioManager'
import { saveHighScore, isSupabaseAvailable } from '@/lib/supabase'

// Quest event types
interface QuestEvent {
  type: 'game_start' | 'game_end' | 'score_achieved' | 'high_score' | 'cosmetic_purchased'
  data: any
}

// Game settings interface
interface GameSettings {
  soundEnabled: boolean
  soundVolume: number
  graphicsQuality: 'low' | 'medium' | 'high'
  showFPS: boolean
  autoSave: boolean
  notifications: boolean
  language: 'en' | 'id'
  gravity: number
  flapForce: number
  pipeSpeed: number
  pipeSpawnDelay: number
  showOnLeaderboard: boolean
  allowFriendRequests: boolean
}
export class GameScene extends Phaser.Scene {
  private bird!: Phaser.GameObjects.Sprite
  private pipes!: Phaser.GameObjects.Group
  private background!: Phaser.GameObjects.Rectangle
  private ground!: Phaser.GameObjects.Rectangle
  private scoreText!: Phaser.GameObjects.Text
  private difficultyText!: Phaser.GameObjects.Text
  private countdownText!: Phaser.GameObjects.Text
  
  // Scrolling background
  private background1!: Phaser.GameObjects.GameObject
  private background2!: Phaser.GameObjects.GameObject
  private backgroundSpeed: number = 0.5
  private score: number = 0
  private isGameOver: boolean = false
  private isGameStarted: boolean = false
  private startScreenElements: Phaser.GameObjects.GameObject[] = []
  private pipeTimer!: Phaser.Time.TimerEvent
  private flapSound!: Phaser.Sound.BaseSound
  private hitSound!: Phaser.Sound.BaseSound
  private scoreSound!: Phaser.Sound.BaseSound
  
  // Game physics constants - will be overridden by settings
  private readonly DEFAULT_GRAVITY = 1000  // Optimized gravity for proper falling speed (was 800)
  private readonly DEFAULT_FLAP_FORCE = -600  // Optimized flap force to counter higher gravity (was -500)
  private readonly PIPE_SPEED = 3.5  // Balanced pipe speed for optimal gameplay (was 4)
  private readonly PIPE_SPAWN_DELAY = 3000  // Balanced delay between pipes (3 seconds) for optimal gameplay
  private readonly PIPE_RESPAWN_X = 800  // Balanced respawn position for closer pipe spacing
  private readonly BASE_PIPE_SPACING = 500  // Base distance between pipe sets (in pixels) - closer spacing
  private readonly MIN_PIPE_SPACING = 400   // Minimum distance - closer but allows for difficulty progression
  private readonly MAX_ACTIVE_PIPES = 3  // Maximum number of pipe sets on screen
  private readonly BASE_PIPE_GAP = 140  // Gap between pipes (balanced for optimal gameplay)
  private readonly MIN_PIPE_GAP = 140   // Consistent gap - no variation for fairness
  
  // Track scored pipes to prevent multiple scoring
  private scoredPipes: Set<any> = new Set()
  
  // Pipe management
  private activePipes: any[] = [] // Track active pipe sets
  private lastPipeSpawnTime: number = 0
  // Removed obstacle system for simpler gameplay
  
  // Difficulty progression
  private difficultyLevel: number = 0
  private pipesPassed: number = 0

  // Cosmetic system
  private selectedCosmetic: string | null = null
  private selectedPipeCosmetic: string | null = null
  
  // Quest tracking
  private gamesPlayedToday: number = 0
  private totalScoreThisWeek: number = 0
  private gamesPlayedTotal: number = 0

  // Game settings
  private gameSettings: GameSettings | null = null

  // Audio system
  private audioManager: AudioManager | null = null

  // Pipe spawn countdown
  private pipeSpawnCountdown: number = 2 // 2 seconds
  private countdownTimer!: Phaser.Time.TimerEvent
  private isCountdownFinished: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { selectedCosmetic?: string; selectedPipeCosmetic?: string }) {
    // Get selected cosmetic from game data
    this.selectedCosmetic = data.selectedCosmetic || null
    this.selectedPipeCosmetic = data.selectedPipeCosmetic || null
    console.log(`GameScene initialized with cosmetic: ${this.selectedCosmetic}, pipe cosmetic: ${this.selectedPipeCosmetic}`)
  }

  setSettings(settings: GameSettings) {
    this.gameSettings = settings
    console.log('Game settings applied:', settings)
    
    // Apply settings to game
    this.applySettings()
    
    // Update audio manager if it exists
    if (this.audioManager) {
      const audioConfig: AudioConfig = {
        soundEnabled: settings.soundEnabled,
        soundVolume: settings.soundVolume
      }
      this.audioManager.updateAudioConfig(audioConfig)
    }
  }

  private applySettings() {
    if (!this.gameSettings) return

    // Apply physics settings
    if (this.physics && this.physics.world) {
      this.physics.world.gravity.y = this.gameSettings.gravity
    }

    // Apply audio settings to AudioManager
    if (this.audioManager) {
      const audioConfig: AudioConfig = {
        soundEnabled: this.gameSettings.soundEnabled,
        soundVolume: this.gameSettings.soundVolume
      }
      this.audioManager.updateAudioConfig(audioConfig)
      console.log('Audio settings applied to AudioManager:', audioConfig)
    }

    // Apply audio settings to Phaser sound system (fallback)
    if (this.sound) {
      this.sound.volume = this.gameSettings.soundVolume / 100
      this.sound.mute = !this.gameSettings.soundEnabled
    }

    console.log('Settings applied to game scene')
  }

  private initializeAudio() {
    try {
      const audioConfig: AudioConfig = {
        soundEnabled: this.gameSettings?.soundEnabled ?? true,
        soundVolume: this.gameSettings?.soundVolume ?? 70
      }
      
      this.audioManager = new AudioManager(this, audioConfig)
      console.log('Audio manager initialized with settings:', audioConfig)
    } catch (error) {
      console.error('Failed to initialize audio manager:', error)
    }
  }

  create() {
    this.score = 0
    this.isGameOver = false
    this.isGameStarted = false
    this.scoredPipes.clear()
    this.activePipes = []
    this.lastPipeSpawnTime = 0
    this.difficultyLevel = 0
    this.pipesPassed = 0

    // Preload sprites
    this.load.image('pipe_sprite', '/Sprite-0003.png')
    this.load.image('background_sprite', '/Background5.png')
    
    // Preload bird sprites
    this.load.image('bird_default', '/Bird2-export.png') // Default character
    this.load.image('bird_1', '/Bird1.png')
    this.load.image('bird_3', '/Bird3.png')
    this.load.image('bird_4', '/Bird4.png')
    this.load.image('bird_5', '/Bird5.png')
    this.load.image('bird_6', '/Bird6.png')
    this.load.image('bird_7', '/Bird7.png')
    
    // Preload pipe sprites for store
    this.load.image('pipe_cosmetic_4', '/Sprite-0004.png')
    this.load.image('pipe_cosmetic_5', '/Sprite-0005.png')
    this.load.image('pipe_cosmetic_6', '/Sprite-0006.png')
    this.load.image('pipe_cosmetic_7', '/Sprite-0007.png')
    
    this.load.once('complete', () => {
      console.log('All sprites preloaded successfully')
      // Reload background with actual sprite if it was using fallback
      this.reloadBackgroundWithSprite()

    // Initialize audio manager
    this.initializeAudio()

      // Apply settings after audio manager is initialized
      this.applySettings()

      // Start background music
      if (this.audioManager) {
        this.audioManager.startBackgroundMusic()
      }

      // Create start screen after sprites are loaded
    this.createStartScreen()
    })
    this.load.start()
  }

  private createScrollingBackground() {
    // Check if background sprite is loaded, if not create fallback
    if (this.textures.exists('background_sprite')) {
      // Create two background tiles for seamless scrolling
      this.background1 = this.add.tileSprite(400, 390, 800, 780, 'background_sprite')
      this.background2 = this.add.tileSprite(1200, 390, 800, 780, 'background_sprite')
      
      console.log('Scrolling background created with Background5.png')
    } else {
      // Create fallback background with night city theme colors
      this.background1 = this.add.rectangle(400, 390, 800, 780, 0x1a1a2e)
      this.background2 = this.add.rectangle(1200, 390, 800, 780, 0x1a1a2e)
      
      // Add some stars for night effect
      for (let i = 0; i < 50; i++) {
        const star = this.add.circle(
          Phaser.Math.Between(0, 800), 
          Phaser.Math.Between(0, 780), 
          1, 
          0xffffff, 
          0.8
        )
        star.setScrollFactor(0)
      }
      
      console.log('Fallback background created - waiting for Background5.png to load')
    }
    
    // Set scroll factors to 0 so they don't move with camera
    if (this.background1 && typeof (this.background1 as any).setScrollFactor === 'function') {
      (this.background1 as any).setScrollFactor(0)
    }
    if (this.background2 && typeof (this.background2 as any).setScrollFactor === 'function') {
      (this.background2 as any).setScrollFactor(0)
    }
  }

  private reloadBackgroundWithSprite() {
    // Check if we need to replace fallback background with actual sprite
    if (this.textures.exists('background_sprite') && this.background1 && this.background2) {
      // Check if current backgrounds are rectangles (fallback)
      if (this.background1.type === 'Rectangle') {
        console.log('Replacing fallback background with Background5.png sprite')
        
        // Destroy old fallback backgrounds
        this.background1.destroy()
        this.background2.destroy()
        
        // Create new backgrounds with actual sprite
        this.background1 = this.add.tileSprite(400, 390, 800, 780, 'background_sprite') as any
        this.background2 = this.add.tileSprite(1200, 390, 800, 780, 'background_sprite') as any
        
        // Set scroll factors
        if (this.background1 && typeof (this.background1 as any).setScrollFactor === 'function') {
          (this.background1 as any).setScrollFactor(0)
        }
        if (this.background2 && typeof (this.background2 as any).setScrollFactor === 'function') {
          (this.background2 as any).setScrollFactor(0)
        }
        
        console.log('Background successfully replaced with Background5.png')
      }
    }
  }

  private updateScrollingBackground() {
    if (!this.background1 || !this.background2) return

    // Move both backgrounds to the left
    const bg1 = this.background1 as any
    const bg2 = this.background2 as any
    
    // Only move if they have x property (TileSprite or Rectangle)
    if (typeof bg1.x === 'number') {
      bg1.x = bg1.x - this.backgroundSpeed
    }
    if (typeof bg2.x === 'number') {
      bg2.x = bg2.x - this.backgroundSpeed
    }

    // Reset position when first background is completely off screen
    if (typeof bg1.x === 'number' && bg1.x <= -400) {
      bg1.x = 1200
    }

    // Reset position when second background is completely off screen
    if (typeof bg2.x === 'number' && bg2.x <= -400) {
      bg2.x = 1200
    }
  }

  private createStartScreen() {
    // Clear any existing start screen elements
    this.startScreenElements = []

    // Create scrolling background
    this.createScrollingBackground()

    // Create invisible ground for collision detection only (adjusted for 600px height)
    this.ground = this.add.rectangle(400, 580, 800, 40, 0x8B4513)
    this.ground.setScrollFactor(0)
    this.ground.setVisible(false) // Hide ground visually but keep collision
    this.startScreenElements.push(this.ground)

    // Create bird for start screen (static, no physics) - centered for 600px height
    this.bird = this.add.sprite(400, 300, 'bird_default')
    this.bird.setScale(0.15) // Slightly smaller for better proportion with pipe gap
    this.bird.setVisible(true)
    this.bird.setAlpha(1)
    this.startScreenElements.push(this.bird)

    // Apply cosmetic if selected
    if (this.selectedCosmetic) {
      console.log(`Applying selected cosmetic on start screen: ${this.selectedCosmetic}`)
      this.applyCosmetic(this.selectedCosmetic)
    } else {
      // Check if texture exists before setting
      if (this.textures.exists('bird_default')) {
        this.bird.setTexture('bird_default')
        console.log('Applied default bird texture on start screen')
      } else {
        console.log('Bird2-export.png not loaded on start screen, creating placeholder')
        this.createDefaultBird()
      }
    }

    // Add tap to start instruction text
    const tapToStartText = this.add.text(400, 360, 'Tap anywhere to start', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    })
    tapToStartText.setOrigin(0.5, 0.5)
    tapToStartText.setScrollFactor(0)
    this.startScreenElements.push(tapToStartText)

    // Make the entire screen clickable to start the game
    // Add a small delay to prevent immediate triggering from previous events
    this.time.delayedCall(100, () => {
      this.input.on('pointerdown', () => {
        if (!this.isGameStarted) {
          this.startGame()
        }
      })

      // Also listen for keyboard input to start
      this.input.keyboard?.on('keydown', () => {
        if (!this.isGameStarted) {
          this.startGame()
        }
      })
    })
  }

  private async startGame() {
    // Initialize audio on user gesture (first click/tap)
    if (this.audioManager) {
      await this.audioManager.initializeAudioOnUserGesture()
    }

    // Hide start screen elements (but keep bird)
    this.startScreenElements.forEach(element => {
      if (element !== this.bird) {
        element.destroy()
      }
    })
    this.startScreenElements = []

    // Remove start screen input listeners
    this.input.removeAllListeners()

    // Emit game start quest event
    console.log('🎮 Game started - emitting game_start quest event')
    this.emitQuestEvent('game_start', { timestamp: Date.now() })
    console.log('🎮 Game start quest event emitted')

    // Background music is handled globally, no need to start here

    // Initialize game
    this.isGameStarted = true
    this.initializeGame()
  }

  private startPipeSpawnCountdown() {
    // Reset countdown
    this.pipeSpawnCountdown = 2 // 2 seconds
    this.isCountdownFinished = false
    
    // Update countdown text
    this.updateCountdownText()
    
    // Create countdown timer that fires every second
    this.countdownTimer = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateCountdown,
      callbackScope: this,
      loop: true
    })
  }

  private updateCountdown() {
    this.pipeSpawnCountdown--
    this.updateCountdownText()
    
    if (this.pipeSpawnCountdown <= 0) {
      // Countdown finished, start spawning pipes
      this.countdownTimer.destroy()
      this.isCountdownFinished = true
      
      // Start spawning first pipe (no text shown)
      this.spawnPipe()
    }
  }

  private updateCountdownText() {
    this.countdownText.setText(`Pipes start in: ${this.pipeSpawnCountdown}`)
  }

  private resetGameState() {
    console.log('Resetting game state...')
    
    // Reset game flags
    this.isGameOver = false
    this.isGameStarted = false
    this.isCountdownFinished = false
    this.score = 0
    this.pipesPassed = 0
    this.difficultyLevel = 0
    
    // Clear all active pipes
    this.activePipes.forEach(pipeSet => {
      this.destroyPipeSet(pipeSet)
    })
    this.activePipes = []
    
    // Obstacle system removed for simpler gameplay
    
    // Clear pipes group
    if (this.pipes) {
      this.pipes.clear(true, true)
    }
    
    // Reset bird position and state - convert back to static sprite
    if (this.bird) {
      // Store current properties
      const currentTexture = this.bird.texture.key
      const currentScale = this.bird.scaleX
      
      // Destroy the physics bird
      this.bird.destroy()
      
      // Create new static bird for start screen
      this.bird = this.add.sprite(200, 300, currentTexture)
      this.bird.setScale(currentScale)
      this.bird.setVisible(true)
      this.bird.setAlpha(1)
      this.bird.setRotation(0)
      this.bird.setTint(0xffffff) // Remove any tint
      
      console.log('Bird converted back to static sprite for restart')
    }
    
    // Reset score display
    if (this.scoreText) {
      this.scoreText.setText('0')
    }
    
    // Clear any existing game over popup elements
    this.children.list.forEach(child => {
      if (child.name && child.name.includes('gameOver')) {
        child.destroy()
      }
    })
    
    // Clear start screen elements
    this.startScreenElements.forEach(element => {
      if (element && element.destroy) {
        element.destroy()
      }
    })
    this.startScreenElements = []
    
    // Reset input handlers
    this.input.removeAllListeners()
    
    // Stop any active timers
    if (this.pipeTimer) {
      this.pipeTimer.destroy()
    }
    
    // Stop countdown timer
    if (this.countdownTimer) {
      this.countdownTimer.destroy()
    }
    
    // Clear any active pipes
    this.activePipes = []
    
    // Reset world gravity to settings value
    if (this.physics && this.physics.world) {
      const gravityValue: number = this.gameSettings?.gravity || this.DEFAULT_GRAVITY
      this.physics.world.gravity.y = gravityValue
      console.log('World gravity reset to:', gravityValue)
    }
    
    console.log('Game state reset complete')
  }

  private initializeGame() {
    // Create scrolling background for game
    this.createScrollingBackground()
    
    // Convert existing bird from static sprite to physics sprite
    if (this.bird) {
      // Store current position and properties
      const currentX = this.bird.x
      const currentY = this.bird.y
      const currentScale = this.bird.scaleX
      const currentTexture = this.bird.texture.key
      
      // Destroy the static bird
      this.bird.destroy()
      
      // Create new physics bird at same position
      this.bird = this.physics.add.sprite(currentX, currentY, currentTexture)
      this.bird.setScale(currentScale)
      this.bird.setVisible(true)
      this.bird.setAlpha(1)
      
      // Apply physics properties
      if (this.bird.body) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setBounce(0.2)
        // Set gravity to 0 initially - will be set when game actually starts
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(0)
        // Stop any existing velocity
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
      }
      
      console.log('Bird converted from static to physics sprite')
    } else {
      // Create new bird if none exists
      this.bird = this.physics.add.sprite(200, 300, 'bird_default')
      this.bird.setScale(0.15) // Slightly smaller for better proportion with pipe gap
      this.bird.setVisible(true)
      this.bird.setAlpha(1)
      
      if (this.bird.body) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setBounce(0.2)
        // Set gravity to 0 initially - will be set when game actually starts
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(0)
        // Stop any existing velocity
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
      }
    }
    
    // Apply cosmetic if selected, otherwise use default
    if (this.selectedCosmetic) {
      console.log(`Applying selected cosmetic: ${this.selectedCosmetic}`)
      this.applyCosmetic(this.selectedCosmetic)
    } else {
      console.log('No cosmetic selected, using default bird (Bird2-export.png)')
      // Check if texture exists before setting
      if (this.textures.exists('bird_default')) {
      this.bird.setTexture('bird_default')
        console.log('Applied default bird texture successfully')
      } else {
      console.log('Bird2-export.png not loaded, creating placeholder')
      this.createDefaultBird()
      }
    }

    // Pipes group - use completely static group (no physics)
    this.pipes = this.add.group()

    // Score text
    this.scoreText = this.add.text(400, 80, '0', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    this.scoreText.setOrigin(0.5)

    // Difficulty text
    this.difficultyText = this.add.text(400, 130, 'Level 0', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    })
    this.difficultyText.setOrigin(0.5)

    // Countdown text for pipe spawning (hidden but functionality remains)
    this.countdownText = this.add.text(400, 150, 'Pipes start in: 2', {
      fontSize: '20px',
      color: '#ff6b6b',
      stroke: '#000000',
      strokeThickness: 3,
    })
    this.countdownText.setOrigin(0.5)
    this.countdownText.setVisible(false) // Hide the text

    // Physics
    this.physics.add.collider(this.bird, this.ground, () => {
      console.log('🚨 PHASER PHYSICS COLLIDER: Bird hit ground! Game Over!', { 
        birdY: this.bird.y, 
        groundY: this.ground.y 
      })
      if (!this.isGameOver) {
        this.gameOver()
      }
    }, undefined, this)

    // Input - only for flapping during gameplay
    this.input.keyboard?.on('keydown-SPACE', this.flap, this)
    this.input.keyboard?.on('keydown-UP', this.flap, this)
    this.input.on('pointerdown', this.flap, this)
    
    // Add restart input handlers
    this.input.keyboard?.on('keydown-R', this.handleStart, this)
    this.input.keyboard?.on('keydown-ENTER', this.handleStart, this)

    // Start countdown timer for pipe spawning
    this.startPipeSpawnCountdown()

    // Load sounds
    this.loadSounds()
  }

  update() {
    // Update scrolling background (always running)
    this.updateScrollingBackground()

    if (this.isGameOver || !this.isGameStarted) return

    // Rotate bird based on velocity
    if (this.bird.body) {
      const velocity = this.bird.body.velocity.y
      this.bird.angle = Math.min(Math.max(velocity * 0.1, -90), 90)
    }

    // Update pipes movement and management
    this.updatePipes()
    
    // Obstacle system removed for simpler gameplay
    
    // Check if we need to spawn new pipes
    this.checkPipeSpawning()

    // COLLISION CHECK - Simplified and more accurate collision detection
    for (let i = 0; i < this.activePipes.length; i++) {
      const pipeSet = this.activePipes[i]
      
      // Only check collision if pipe is close to bird (within 150 pixels for better performance)
      if (Math.abs(pipeSet.topPipe.x - this.bird.x) < 150) {
        // Get bird bounds using Phaser's built-in method for accuracy
        const birdBounds = this.bird.getBounds()
        
        // Simple bird collision box - no margins to prevent false positives
        const birdLeft = birdBounds.x
        const birdRight = birdBounds.x + birdBounds.width
        const birdTop = birdBounds.y
        const birdBottom = birdBounds.y + birdBounds.height
        
        // Check collision with both pipes using stored collision rectangles
        let hitTopPipe = false
        let hitBottomPipe = false
        
        if (pipeSet.topPipeCollision) {
          // Balanced visual margin - close but no penetration
          const visualMargin = 12 // Balanced margin - close contact but no deep penetration
          hitTopPipe = (birdLeft + visualMargin) < (pipeSet.topPipeCollision.x + pipeSet.topPipeCollision.width) && 
                      (birdRight - visualMargin) > pipeSet.topPipeCollision.x && 
                      (birdTop + visualMargin) < (pipeSet.topPipeCollision.y + pipeSet.topPipeCollision.height) && 
                      (birdBottom - visualMargin) > pipeSet.topPipeCollision.y
        }
        
        if (pipeSet.bottomPipeCollision) {
          // Balanced visual margin - close but no penetration
          const visualMargin = 12 // Balanced margin - close contact but no deep penetration
          hitBottomPipe = (birdLeft + visualMargin) < (pipeSet.bottomPipeCollision.x + pipeSet.bottomPipeCollision.width) && 
                         (birdRight - visualMargin) > pipeSet.bottomPipeCollision.x && 
                         (birdTop + visualMargin) < (pipeSet.bottomPipeCollision.y + pipeSet.bottomPipeCollision.height) && 
                         (birdBottom - visualMargin) > pipeSet.bottomPipeCollision.y
        }
        
        // Check if bird is in the safe gap between pipes
        if (pipeSet.topPipeCollision && pipeSet.bottomPipeCollision) {
          const gapTop = pipeSet.topPipeCollision.y + pipeSet.topPipeCollision.height
          const gapBottom = pipeSet.bottomPipeCollision.y
          const gapTolerance = 10 // Larger tolerance for gap detection to be more fair
          
          // Bird is in safe gap if it's between the pipes with tolerance
          const birdInSafeGap = (birdTop + gapTolerance) > gapTop && (birdBottom - gapTolerance) < gapBottom
          
          // Only trigger collision if bird hits pipe AND is not in safe gap
          if ((hitTopPipe || hitBottomPipe) && !birdInSafeGap) {
            console.log('🚨 COLLISION DETECTED!', {
              hitTopPipe,
              hitBottomPipe,
              birdInSafeGap,
              birdPosition: { x: this.bird.x, y: this.bird.y },
              birdBounds: { left: birdLeft, right: birdRight, top: birdTop, bottom: birdBottom },
              gapTop,
              gapBottom,
              pipeX: pipeSet.topPipe.x,
              visualMargin: 12,
              gapTolerance: 10
            })
            
            if (!this.isGameOver) {
              this.gameOver()
            }
            return
          }
        } else {
          // If collision data is missing, use simple collision check
          if (hitTopPipe || hitBottomPipe) {
            console.log('🚨 SIMPLE COLLISION DETECTED!', {
              hitTopPipe,
              hitBottomPipe,
              birdPosition: { x: this.bird.x, y: this.bird.y }
            })
            
            if (!this.isGameOver) {
              this.gameOver()
            }
            return
          }
        }
      }
    }

    // Additional collision check for bird falling below screen
    if (this.bird.y > 780) {
      console.log('🚨 BIRD FELL BELOW SCREEN! Game Over!', { birdY: this.bird.y })
      if (!this.isGameOver) {
        this.gameOver()
      }
    }
    
    // Additional collision check for bird hitting ceiling (top of screen)
    if (this.bird.y < 0) {
      console.log('🚨 BIRD HIT CEILING! Game Over!', { birdY: this.bird.y })
      if (!this.isGameOver) {
        this.gameOver()
      }
    }
    
    // Manual ground collision detection for more accuracy
    if (this.bird && !this.isGameOver) {
      const birdBottom = this.bird.y + 25 // Bird bottom edge
      const groundTop = 580 // Ground top edge (ground is at y: 580, height: 40)
      
      if (birdBottom >= groundTop) {
        console.log('🚨 MANUAL GROUND COLLISION! Bird hit ground! Game Over!', { 
          birdY: this.bird.y, 
          birdBottom, 
          groundTop 
        })
        if (!this.isGameOver) {
          this.gameOver()
        }
      }
    }
  }

  private flap() {
    if (this.isGameOver || !this.isGameStarted) return

    if (this.bird.body) {
      // Set gravity on first flap to start the game properly
      if ((this.bird.body as Phaser.Physics.Arcade.Body).gravity.y === 0) {
        const gravityValue: number = this.gameSettings?.gravity || this.DEFAULT_GRAVITY
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(gravityValue)
        console.log('Gravity activated on first flap:', gravityValue)
      }
      
      const flapForceValue: number = this.gameSettings?.flapForce || this.DEFAULT_FLAP_FORCE
      ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(flapForceValue)
      
      // Play flap sound using audio manager
      if (this.audioManager) {
        this.audioManager.playFlapSound()
      }
    }
  }

  private handleStart() {
    if (this.isGameOver) {
      console.log('Restarting game - going back to start screen...')
      // Reset game state and go back to start screen
      this.resetGameState()
      this.createStartScreen()
    }
  }

  private getCurrentPipeSpacing(): number {
    // Calculate current pipe spacing based on difficulty level
    const progress = Math.min(this.difficultyLevel / 20, 1) // Max difficulty at level 20
    const spacing = this.BASE_PIPE_SPACING - (this.BASE_PIPE_SPACING - this.MIN_PIPE_SPACING) * progress
    console.log(`🔍 PIPE SPACING DEBUG: Base=${this.BASE_PIPE_SPACING}, Min=${this.MIN_PIPE_SPACING}, Progress=${progress}, Current=${spacing}, Difficulty=${this.difficultyLevel}`)
    return spacing
  }

  private getCurrentPipeGap(): number {
    // Calculate current pipe gap based on difficulty level with random variation
    const progress = Math.min(this.difficultyLevel / 15, 1) // Max difficulty at level 15
    const baseGap = this.BASE_PIPE_GAP - (this.BASE_PIPE_GAP - this.MIN_PIPE_GAP) * progress
    
    // Add random variation to gap size for more challenge (±20px)
    const randomVariation = Phaser.Math.Between(-20, 20)
    const finalGap = Math.max(baseGap + randomVariation, this.MIN_PIPE_GAP)
    
    console.log(`Gap calculation: base=${baseGap}, random=${randomVariation}, final=${finalGap}`)
    return finalGap
  }

  private updateDifficulty() {
    // Increase difficulty every 3 pipes passed
    const newDifficultyLevel = Math.floor(this.pipesPassed / 3)
    if (newDifficultyLevel > this.difficultyLevel) {
      this.difficultyLevel = newDifficultyLevel
      this.difficultyText.setText(`Level ${this.difficultyLevel}`)
      console.log(`Difficulty increased to level ${this.difficultyLevel}! Pipe spacing: ${Math.round(this.getCurrentPipeSpacing())}, Gap: ${Math.round(this.getCurrentPipeGap())}`)
    }
  }

  // Quest event emission
  private emitQuestEvent(type: QuestEvent['type'], data: any) {
    console.log(`🎯 Emitting quest event: ${type}`, data)
    this.events.emit('questEvent', { type, data })
    console.log(`🎯 Quest event emitted successfully: ${type}`)
  }

  private checkPipeSpawning() {
    if (this.isGameOver) return
    
    // Don't spawn if countdown hasn't finished yet
    if (!this.isCountdownFinished) {
      return
    }
    
    // Don't spawn if we already have maximum pipes
    if (this.activePipes.length >= this.MAX_ACTIVE_PIPES) {
      return
    }
    
    // Spawn new pipes based on consistent spacing
    if (this.activePipes.length === 0) {
      // No pipes active, spawn immediately (only after countdown finished)
      this.spawnPipe()
    } else {
      // Check if the last pipe has moved far enough to spawn a new one
      const lastPipe = this.activePipes[this.activePipes.length - 1]
      const currentSpacing = this.getCurrentPipeSpacing()
      
      // Use consistent spacing calculation - check distance from last pipe
      const distanceFromLastPipe = this.PIPE_RESPAWN_X - lastPipe.topPipe.x
      
      console.log(`🔍 PIPE SPAWN DEBUG: Last pipe x=${lastPipe.topPipe.x}, Respawn x=${this.PIPE_RESPAWN_X}, Distance=${distanceFromLastPipe}, Required spacing=${currentSpacing}`)
      
      if (distanceFromLastPipe >= currentSpacing) {
        this.spawnPipe()
      }
    }
  }

  private updatePipes() {
    // Update each active pipe set
    for (let i = this.activePipes.length - 1; i >= 0; i--) {
      const pipeSet = this.activePipes[i]
      
      // Move both pipes in the set (only if game is not over)
      if (!this.isGameOver) {
        const pipeSpeed = this.gameSettings?.pipeSpeed || this.PIPE_SPEED
        pipeSet.topPipe.x -= pipeSpeed
        pipeSet.bottomPipe.x -= pipeSpeed
        
        // Update invisible collision data positions with pipes
        if (pipeSet.topPipeCollision) {
          pipeSet.topPipeCollision.x -= pipeSpeed
        }
        if (pipeSet.bottomPipeCollision) {
          pipeSet.bottomPipeCollision.x -= pipeSpeed
        }
        
        // Debug: Log collision data positions for collision detection
        if (Math.abs(pipeSet.topPipe.x - 200) < 50) { // When pipe is near bird
          console.log('🔍 COLLISION DATA POSITIONS:', {
            topPipe: {
              x: pipeSet.topPipe.x,
              y: pipeSet.topPipe.y,
              collisionData: pipeSet.topPipeCollision ? {
                x: pipeSet.topPipeCollision.x, 
                y: pipeSet.topPipeCollision.y,
                width: pipeSet.topPipeCollision.width,
                height: pipeSet.topPipeCollision.height
              } : 'none'
            },
            bottomPipe: {
              x: pipeSet.bottomPipe.x,
              y: pipeSet.bottomPipe.y,
              collisionData: pipeSet.bottomPipeCollision ? {
                x: pipeSet.bottomPipeCollision.x, 
                y: pipeSet.bottomPipeCollision.y,
                width: pipeSet.bottomPipeCollision.width,
                height: pipeSet.bottomPipeCollision.height
              } : 'none'
            }
          })
        }
      }
      
      // Check for scoring when pipes pass the bird (only once per pipe set)
      if (pipeSet.topPipe.x <= 200 && !pipeSet.scored) {
        this.scorePoint()
        pipeSet.scored = true
        this.pipesPassed++
        this.updateDifficulty()
        console.log(`Scored! Pipe set at x: ${pipeSet.topPipe.x}, total score: ${this.score}, pipes passed: ${this.pipesPassed}`)
      }
      
      // Collision check is now handled in the main update() loop for better performance
      
      // Remove pipes that are off screen
      if (pipeSet.topPipe.x < -100) {
        this.destroyPipeSet(pipeSet)
        this.activePipes.splice(i, 1)
        console.log(`Pipe set destroyed and removed. Active pipes: ${this.activePipes.length}`)
      }
    }
  }

  // Obstacle system removed for simpler gameplay



  private destroyPipeSet(pipeSet: any) {
    pipeSet.topPipe.destroy()
    pipeSet.bottomPipe.destroy()
    
    // Collision data is just plain objects, no need to destroy
    // (Previously destroyed red line visual elements)
  }

  private getPipeSpriteKey(): string {
    // Map pipe cosmetic types to sprite keys
    const pipeCosmeticMap: { [key: string]: string } = {
      'pipe_4': 'pipe_cosmetic_4',
      'pipe_5': 'pipe_cosmetic_5',
      'pipe_6': 'pipe_cosmetic_6',
      'pipe_7': 'pipe_cosmetic_7'
    }
    
    // Check if a pipe cosmetic is selected and exists
    if (this.selectedPipeCosmetic && pipeCosmeticMap[this.selectedPipeCosmetic]) {
      const spriteKey = pipeCosmeticMap[this.selectedPipeCosmetic]
      if (this.textures.exists(spriteKey)) {
        console.log(`Using pipe cosmetic: ${spriteKey}`)
        return spriteKey
      }
    }
    
    // Default to original pipe sprite
    console.log('Using default pipe sprite')
    return 'pipe_sprite'
  }

  private spawnPipe() {
    if (this.isGameOver) return

    const gap = this.getCurrentPipeGap() // Use dynamic gap size based on difficulty
    // Calculate pipe height to ensure pipes touch top and bottom of game area
    const gameHeight = 780 // Game height
    
    // Use random gap position for more challenging gameplay
    const minGapPosition = 150 // Minimum gap position from top (more challenging)
    const maxGapPosition = 500 // Maximum gap position from top (more challenging)
    const pipeHeight = Phaser.Math.Between(minGapPosition, maxGapPosition) // Random gap position
    
    // Add difficulty-based gap position variation
    const difficultyVariation = Math.min(this.difficultyLevel * 10, 100) // Increase variation with difficulty
    const finalGapPosition = Phaser.Math.Between(
      Math.max(minGapPosition - difficultyVariation, 100), // Can go higher up
      Math.min(maxGapPosition + difficultyVariation, 600)  // Can go lower down
    )
    
    console.log(`🎯 Random gap position: ${finalGapPosition}px from top - Gap size: ${gap}px - Difficulty: ${this.difficultyLevel}`)
    
    // Calculate consistent spawn position
    let x: number
    if (this.activePipes.length === 0) {
      // First pipe spawns at respawn position
      x = this.PIPE_RESPAWN_X
    } else {
      // Subsequent pipes spawn at consistent spacing from last pipe
      const lastPipe = this.activePipes[this.activePipes.length - 1]
      const currentSpacing = this.getCurrentPipeSpacing()
      x = lastPipe.topPipe.x + currentSpacing
    }

    console.log(`🚀 SPAWNING PIPE #${this.activePipes.length + 1}: x=${x}, height=${pipeHeight}, gap=${Math.round(gap)}, difficulty=${this.difficultyLevel}`)
    if (this.activePipes.length > 0) {
      const lastPipe = this.activePipes[this.activePipes.length - 1]
      const actualSpacing = x - lastPipe.topPipe.x
      console.log(`📏 SPACING CHECK: Last pipe x=${lastPipe.topPipe.x}, New pipe x=${x}, Actual spacing=${actualSpacing}, Required spacing=${this.getCurrentPipeSpacing()}`)
    }

    // Determine which pipe sprite to use
    const pipeSpriteKey = this.getPipeSpriteKey()
    
    // Create top pipe - extend from top of game to gap
    const topPipeHeight = finalGapPosition // Height from top to gap
    const topPipe = this.add.image(x, topPipeHeight, pipeSpriteKey)
    topPipe.setScale(1, -1)  // Flip vertically
    topPipe.setOrigin(0, 0)  // Set origin to top-left of the flipped pipe
    
    // Scale top pipe to fill from top (0) to gap position
    const topPipeScaleY = topPipeHeight / topPipe.height
    topPipe.setScale(1, -topPipeScaleY) // Negative scale for flip + height adjustment
    
    console.log(`Top pipe created at x: ${x}, y: ${topPipeHeight}, scaleY: ${-topPipeScaleY} using sprite: ${pipeSpriteKey}`)

    // Create bottom pipe - extend from gap to bottom of game
    const bottomPipeY = finalGapPosition + gap // Start position (gap bottom)
    const bottomPipeHeight = gameHeight - bottomPipeY // Height from gap to bottom
    const bottomPipe = this.add.image(x, bottomPipeY, pipeSpriteKey)
    bottomPipe.setOrigin(0, 0)
    
    // Scale bottom pipe to fill from gap to bottom
    const bottomPipeScaleY = bottomPipeHeight / bottomPipe.height
    bottomPipe.setScale(1, bottomPipeScaleY)
    
    console.log(`Bottom pipe created at x: ${x}, y: ${bottomPipeY}, scaleY: ${bottomPipeScaleY}`)

    // Calculate collision bounds for accurate collision detection
    const pipeWidth = topPipe.width * topPipe.scaleX // Actual width after scaling
    
    // Create precise collision rectangles that match the visual pipe exactly
    // Top pipe collision rectangle (from top of screen to gap)
    const topPipeCollisionRect = { 
      x: x, // Pipe X position
      y: 0, // Starts from top of screen
      width: pipeWidth, // Full pipe width
      height: finalGapPosition // Height from top to gap
    }
    
    // Bottom pipe collision rectangle (from gap to bottom of screen)
    const bottomPipeCollisionRect = { 
      x: x, // Pipe X position
      y: bottomPipeY, // Starts at gap position
      width: pipeWidth, // Full pipe width
      height: gameHeight - bottomPipeY // Height from gap to bottom
    }

    // DEBUG: Log collision rectangle dimensions
    console.log('🔧 COLLISION RECTANGLES CREATED:', {
      pipeX: x,
      pipeWidth: pipeWidth,
      finalGapPosition: finalGapPosition,
      gap: gap,
      topPipeCollision: {
        x: topPipeCollisionRect.x,
        y: topPipeCollisionRect.y,
        width: topPipeCollisionRect.width,
        height: topPipeCollisionRect.height,
        right: topPipeCollisionRect.x + topPipeCollisionRect.width,
        bottom: topPipeCollisionRect.y + topPipeCollisionRect.height
      },
      bottomPipeCollision: {
        x: bottomPipeCollisionRect.x,
        y: bottomPipeCollisionRect.y,
        width: bottomPipeCollisionRect.width,
        height: bottomPipeCollisionRect.height,
        right: bottomPipeCollisionRect.x + bottomPipeCollisionRect.width,
        bottom: bottomPipeCollisionRect.y + bottomPipeCollisionRect.height
      }
    })

    // Create pipe set object
    const pipeSet = {
      topPipe: topPipe,
      bottomPipe: bottomPipe,
      // Store invisible collision data for collision detection
      topPipeCollision: topPipeCollisionRect,
      bottomPipeCollision: bottomPipeCollisionRect,
      scored: false
    }

    // Add to active pipes
    this.activePipes.push(pipeSet)
    
    console.log(`New pipe set created with invisible collision detection. Total active pipes: ${this.activePipes.length}`)
    
    // Obstacle system removed for simpler gameplay
  }

  // Obstacle system removed for simpler gameplay

  private scorePoint() {
    if (this.isGameOver) return

    this.score++
    this.scoreText.setText(this.score.toString())
    
    // Play score sound using audio manager
    if (this.audioManager) {
      this.audioManager.playScoreSound()
    }

    // Emit score event to React
    this.game.events.emit('score', this.score)
    this.game.events.emit('scoreUpdate', this.score)

    // Emit quest event for score achievement
    this.emitQuestEvent('score_achieved', { 
      score: this.score, 
      timestamp: Date.now() 
    })
  }

  private gameOver() {
    if (this.isGameOver) {
      console.log('GameOver called again but already game over!')
      return
    }

    this.isGameOver = true
    
    // Debug: Log stack trace to see what caused game over
    console.log('🚨🚨🚨 GAME OVER TRIGGERED! 🚨🚨🚨')
    console.log('Stack trace:', new Error().stack)
    console.log('Bird position:', { x: this.bird?.x, y: this.bird?.y })
    console.log('Score:', this.score)

    // Emit game end quest event
    this.emitQuestEvent('game_end', { 
      score: this.score, 
      pipesPassed: this.pipesPassed,
      difficultyLevel: this.difficultyLevel,
      timestamp: Date.now()
    })
    
    // Save high score to Supabase if available
    this.saveHighScoreToDatabase()
    
    // Play game over sound using audio manager
    if (this.audioManager) {
      this.audioManager.playGameOverSound()
    }

    // Make pipes normal (not transparent) but behind the falling bird
    this.activePipes.forEach(pipeSet => {
      if (pipeSet.topPipe) {
        pipeSet.topPipe.setAlpha(1.0) // Keep pipes fully visible (normal)
        pipeSet.topPipe.setDepth(0) // Move pipes to background layer
      }
      if (pipeSet.bottomPipe) {
        pipeSet.bottomPipe.setAlpha(1.0) // Keep pipes fully visible (normal)
        pipeSet.bottomPipe.setDepth(0) // Move pipes to background layer
      }
    })
    
    // Ensure bird is always visible on top
    if (this.bird) {
      this.bird.setDepth(10) // Put bird on top layer
    }

    // Make bird fall down naturally from collision position
    if (this.bird.body) {
      const body = this.bird.body as Phaser.Physics.Arcade.Body
      // Keep gravity active so bird falls down naturally
      body.setGravityY(this.gameSettings?.gravity || this.DEFAULT_GRAVITY)
      // Set downward velocity to make bird fall immediately
      body.setVelocityY(200) // Fall down with some initial speed
      // Enable world bounds collision to keep bird on screen
      body.setCollideWorldBounds(true)
      // Don't make bird immovable - let it fall naturally
    }
    
    // Keep world gravity active so bird continues to fall
    this.physics.world.gravity.y = this.gameSettings?.gravity || this.DEFAULT_GRAVITY
    console.log('Bird falling down naturally from collision position')
    
    // Make bird non-interactive and remove input handlers
    this.bird.setInteractive(false)
    this.bird.removeInteractive()
    
    // Don't disable input completely - we need it for the restart button
    // this.input.enabled = false
    
    // Add visual effect to show bird is falling but keep it highly visible
    this.bird.setTint(0x888888) // Make bird slightly grayed out
    this.bird.setAlpha(1.0) // Keep bird fully visible (not transparent)
    this.bird.setDepth(10) // Ensure bird is on top layer
    
    // Add falling rotation effect like in original Flappy Bird
    this.time.addEvent({
      delay: 16, // ~60fps
      callback: () => {
        if (this.bird && this.bird.body) {
          const velocity = (this.bird.body as Phaser.Physics.Arcade.Body).velocity.y
          // Rotate bird based on falling speed (like original Flappy Bird)
          this.bird.angle = Math.min(Math.max(velocity * 0.15, -90), 90)
          
          // Stop bird from falling below ground level (keep visible on screen)
          if (this.bird.y >= 580) { // Ground level (adjusted for 600px height)
            this.bird.y = 580
            const body = this.bird.body as Phaser.Physics.Arcade.Body
            body.setVelocityY(0) // Stop falling
            body.setGravityY(0) // Stop gravity
            this.bird.setAngle(0) // Reset to horizontal when on ground
          }
        }
      },
      loop: true
    })

    // Create game over popup box
    this.createGameOverPopup()

    // Emit game over event to React
    this.game.events.emit('gameOver', this.score)

    // Remove automatic restart - let user manually restart
    // this.time.delayedCall(2000, () => {
    //   this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('GameScene'), this)
    //   this.input.on('pointerdown', () => this.scene.start('GameScene'), this)
    // })
  }

  private createGameOverPopup() {
    // Create popup background (centered for 780px height)
    const popupBg = this.add.rectangle(400, 390, 400, 320, 0x2C2C2C, 0.3)
    popupBg.setStrokeStyle(3, 0x444444)
    popupBg.setOrigin(0.5)
    
    // Add subtle shadow effect
    const shadow = this.add.rectangle(403, 393, 400, 320, 0x000000, 0.1)
    shadow.setOrigin(0.5)
    shadow.setDepth(-1)
    
    // Game Over title
    const gameOverText = this.add.text(400, 310, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    gameOverText.setOrigin(0.5)
    
    // Score display
    const scoreText = this.add.text(400, 450, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    scoreText.setOrigin(0.5)
    
    // High score display - get from localStorage or use current score
    const savedHighScore = localStorage.getItem('flappyBirdHighScore') || '0'
    const currentHighScore = Math.max(parseInt(savedHighScore), this.score)
    localStorage.setItem('flappyBirdHighScore', currentHighScore.toString())
    
    const highScoreText = this.add.text(400, 380, `High Score: ${currentHighScore}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    highScoreText.setOrigin(0.5)
    
    // Main Menu button
    const mainMenuBtn = this.add.rectangle(320, 435, 150, 50, 0x4a90e2)
    mainMenuBtn.setStrokeStyle(3, 0x000000)
    mainMenuBtn.setInteractive()
    
    const mainMenuText = this.add.text(320, 435, 'Main Menu', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    mainMenuText.setOrigin(0.5)
    
    // Add hover effects for Main Menu button
    mainMenuBtn.on('pointerover', () => {
      mainMenuBtn.setFillStyle(0x357abd)
    })
    
    mainMenuBtn.on('pointerout', () => {
      mainMenuBtn.setFillStyle(0x4a90e2)
    })
    
    mainMenuBtn.on('pointerdown', () => {
      // Go back to main menu
      this.game.events.emit('goToMainMenu')
    })
    
    // Restart button
    const restartBtn = this.add.rectangle(480, 435, 150, 50, 0x00ff00)
    restartBtn.setStrokeStyle(3, 0x000000)
    restartBtn.setInteractive()
    
    const restartText = this.add.text(480, 435, 'Restart', {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    restartText.setOrigin(0.5)
    
    // Add hover effects for Restart button
    restartBtn.on('pointerover', () => {
      restartBtn.setFillStyle(0x00cc00)
    })
    
    restartBtn.on('pointerout', () => {
      restartBtn.setFillStyle(0x00ff00)
    })
    
    restartBtn.on('pointerdown', () => {
      this.handleStart()
    })
  }

  private loadSounds() {
    // Initialize audio manager with default settings
    const audioConfig = {
      soundEnabled: true,
      soundVolume: 50
    }
    
    this.audioManager = new AudioManager(this, audioConfig)
    console.log('Sound system initialized with Web Audio API')
  }

  private applyCosmetic(cosmeticType: string) {
    console.log(`Applying cosmetic: ${cosmeticType}`)
    
    // Map cosmetic IDs to bird sprite keys
    const birdCosmeticMap: { [key: string]: string } = {
      'bird_default': 'bird_default',
      'bird_1': 'bird_1',
      'bird_3': 'bird_3',
      'bird_4': 'bird_4',
      'bird_5': 'bird_5',
      'bird_6': 'bird_6',
      'bird_7': 'bird_7'
    }
    
    // Map pipe cosmetic IDs to pipe sprite keys
    const pipeCosmeticMap: { [key: string]: string } = {
      'pipe_4': 'pipe_cosmetic_4',
      'pipe_5': 'pipe_cosmetic_5',
      'pipe_6': 'pipe_cosmetic_6',
      'pipe_7': 'pipe_cosmetic_7'
    }
    
    // Check if it's a bird cosmetic
    if (birdCosmeticMap[cosmeticType]) {
      const spriteKey = birdCosmeticMap[cosmeticType]
      
      // Check if the sprite texture exists
      if (this.textures.exists(spriteKey)) {
        // Apply the cosmetic sprite to the bird
        this.bird.setTexture(spriteKey)
        console.log(`Applied bird cosmetic sprite: ${spriteKey}`)
      } else {
        console.log(`Bird cosmetic sprite ${spriteKey} not found, using default`)
        this.bird.setTexture('bird_default')
      }
    }
    // Check if it's a pipe cosmetic
    else if (pipeCosmeticMap[cosmeticType]) {
      const spriteKey = pipeCosmeticMap[cosmeticType]
      
      // Store the selected pipe cosmetic for use when creating pipes
      this.selectedPipeCosmetic = cosmeticType
      console.log(`Selected pipe cosmetic: ${cosmeticType}`)
    }
    else {
      console.log(`Unknown cosmetic type: ${cosmeticType}, using default`)
      this.bird.setTexture('bird_default')
    }
  }

  private createDefaultBird() {
    console.log('Creating default bird placeholder')
    
    // Create a simple colored rectangle as bird placeholder
    const graphics = this.add.graphics()
    graphics.fillStyle(0x00ff00) // Green color
    graphics.fillCircle(0, 0, 10) // Small circle
    graphics.generateTexture('bird_placeholder', 20, 20)
    graphics.destroy()
    
    // Set the bird to use the placeholder
    this.bird.setTexture('bird_placeholder')
    this.bird.setVisible(true)
    this.bird.setAlpha(1)
    console.log('Applied bird placeholder texture')
  }

  private async saveHighScoreToDatabase() {
    try {
      // Get player data from game events
      const playerData = await this.getPlayerData()
      
      console.log('Received player data:', playerData)
      
      if (playerData && playerData.walletAddress) {
        console.log('Saving high score to database:', {
          walletAddress: playerData.walletAddress,
          playerName: playerData.playerName || 'Anonymous',
          score: this.score
        })
        
        if (isSupabaseAvailable()) {
          // Try to get player name from localStorage if not provided
          let finalPlayerName = playerData.playerName
          if (!finalPlayerName || finalPlayerName === 'Anonymous') {
            const savedName = localStorage.getItem('flappyBirdPlayerName')
            if (savedName) {
              finalPlayerName = savedName
              console.log('🔍 Using saved player name for Supabase:', finalPlayerName)
            }
          }
          
          await saveHighScore(playerData.walletAddress, this.score, finalPlayerName)
          console.log('High score saved to Supabase successfully with name:', finalPlayerName)
        } else {
          console.log('Supabase not available, saving to localStorage only')
          // Fallback to localStorage - save to leaderboard format
          this.saveToLocalStorageLeaderboard(playerData.walletAddress, this.score, playerData.playerName || 'Anonymous')
        }
      } else {
        console.log('Player data not available, saving to localStorage only')
        // Fallback to localStorage - save with anonymous data
        this.saveToLocalStorageLeaderboard('anonymous', this.score, 'Anonymous')
      }
    } catch (error) {
      console.error('Error saving high score to database:', error)
      // Fallback to localStorage - save with anonymous data
      this.saveToLocalStorageLeaderboard('anonymous', this.score, 'Anonymous')
    }
  }

  private saveToLocalStorageLeaderboard(walletAddress: string, score: number, playerName: string) {
    try {
      // Try to get player name from localStorage if not provided
      let finalPlayerName = playerName
      console.log('🔍 Player name debugging:', {
        originalPlayerName: playerName,
        walletAddress: walletAddress,
        score: score
      })
      
      if (!finalPlayerName || finalPlayerName === 'Anonymous') {
        const savedName = localStorage.getItem('flappyBirdPlayerName')
        console.log('🔍 Checking localStorage for player name:', savedName)
        if (savedName) {
          finalPlayerName = savedName
          console.log('✅ Using saved player name from localStorage:', finalPlayerName)
        } else {
          console.log('❌ No player name found in localStorage')
        }
      } else {
        console.log('✅ Using provided player name:', finalPlayerName)
      }
      
      // Create leaderboard entry
      const leaderboardKey = `leaderboard_${walletAddress}_${Date.now()}`
      const leaderboardEntry = {
        id: leaderboardKey,
        player_address: walletAddress,
        player_name: finalPlayerName,
        score: score,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      
      // Save to localStorage
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboardEntry))
      
      // Also save to flappyBirdHighScores array for HighScoreDashboard
      const existingScores = localStorage.getItem('flappyBirdHighScores')
      let scores = existingScores ? JSON.parse(existingScores) : []
      
      // Add new score
      scores.push(leaderboardEntry)
      
      // Sort by score (highest first) and keep top 100
      scores.sort((a: any, b: any) => b.score - a.score)
      scores = scores.slice(0, 100)
      
      // Save back to localStorage
      localStorage.setItem('flappyBirdHighScores', JSON.stringify(scores))
      
      console.log('High score saved to localStorage leaderboard:', leaderboardEntry)
    } catch (error) {
      console.error('Error saving to localStorage leaderboard:', error)
    }
  }

  private async getPlayerData(): Promise<{ walletAddress: string; playerName?: string } | null> {
    return new Promise((resolve) => {
      // Emit event to get player data from React component
      this.game.events.emit('getPlayerData', (data: { walletAddress: string; playerName?: string } | null) => {
        resolve(data)
      })
      
      // Timeout after 1 second if no response
      setTimeout(() => {
        resolve(null)
      }, 1000)
    })
  }
}

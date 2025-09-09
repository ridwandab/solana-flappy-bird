import * as Phaser from 'phaser'
import { AudioManager, AudioConfig } from '@/lib/audioManager'

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
  
  // Game physics constants
  private readonly GRAVITY = 30  // Extremely low gravity for very easy control
  private readonly FLAP_FORCE = -350  // Moderate flap force for smooth jumping
  private readonly PIPE_SPEED = 3  // Slower speed for better visibility
  private readonly PIPE_SPAWN_DELAY = 2000  // Shorter delay between pipes (2 seconds)
  private PIPE_RESPAWN_X = 800
  private readonly BASE_PIPE_SPACING = 400  // Base distance between pipe sets (in pixels)
  private readonly MIN_PIPE_SPACING = 200   // Minimum distance (gets closer over time)
  private readonly MAX_ACTIVE_PIPES = 3  // Maximum number of pipe sets on screen
  private readonly BASE_PIPE_GAP = 120  // Base gap between pipes (reduced for more challenge)
  private readonly MIN_PIPE_GAP = 60    // Minimum gap (gets smaller over time, more challenging)
  
  // Track scored pipes to prevent multiple scoring
  private scoredPipes: Set<any> = new Set()
  
  // Pipe management
  private activePipes: any[] = [] // Track active pipe sets
  private lastPipeSpawnTime: number = 0
  private activeObstacles: any[] = [] // Store random obstacles
  
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

  private handleResponsiveCanvas() {
    // Listen for resize events
    this.scale.on('resize', this.onResize, this)
    
    // Set up responsive scaling
    this.scale.on('orientationchange', this.onOrientationChange, this)
    
    // Initial responsive setup
    this.onResize()
  }

  private onResize() {
    const { width, height } = this.scale.gameSize
    
    // Adjust camera bounds
    this.cameras.main.setBounds(0, 0, width, height)
    
    // Adjust physics world bounds
    if (this.physics && this.physics.world) {
      this.physics.world.setBounds(0, 0, width, height)
    }
    
    // Reposition UI elements if they exist
    this.repositionUIElements(width, height)
    
    console.log(`Canvas resized to: ${width}x${height}`)
  }

  private onOrientationChange() {
    // Handle orientation change
    const { width, height } = this.scale.gameSize
    console.log(`Orientation changed to: ${width}x${height}`)
    
    // Ensure we have valid dimensions before repositioning
    if (width && height && width > 0 && height > 0) {
      // Reposition all game elements
      this.repositionGameElements(width, height)
    } else {
      console.warn('Invalid dimensions in onOrientationChange:', width, height)
    }
  }

  private repositionUIElements(width: number, height: number) {
    // Reposition score text
    if (this.scoreText) {
      this.scoreText.setPosition(width / 2, 50)
    }
    
    // Reposition difficulty text
    if (this.difficultyText) {
      this.difficultyText.setPosition(width / 2, 80)
    }
  }

  private repositionGameElements(width: number, height: number) {
    // Ensure we have valid dimensions
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn('Invalid dimensions for repositionGameElements:', width, height)
      return
    }
    
    // Reposition bird
    if (this.bird) {
      this.bird.setPosition(width * 0.2, height / 2)
    }
    
    // Reposition ground
    if (this.ground) {
      this.ground.setPosition(width / 2, height - 25)
      this.ground.setSize(width, 50)
    }
    
    // Reposition background elements
    this.repositionBackground(width, height)
    
    // Reposition pipes
    this.repositionPipes(width, height)
  }

  private repositionBackground(width: number, height: number) {
    if (this.background1 && this.background2) {
      // Update background positions and sizes
      if (this.background1.type === 'TileSprite') {
        (this.background1 as any).setPosition(width / 2, height / 2)
        ;(this.background1 as any).setSize(width, height)
        ;(this.background2 as any).setPosition(width + width / 2, height / 2)
        ;(this.background2 as any).setSize(width, height)
      } else {
        // Rectangle backgrounds - cast to Rectangle type
        const bg1 = this.background1 as Phaser.GameObjects.Rectangle
        const bg2 = this.background2 as Phaser.GameObjects.Rectangle
        bg1.setPosition(width / 2, height / 2)
        bg1.setSize(width, height)
        bg2.setPosition(width + width / 2, height / 2)
        bg2.setSize(width, height)
      }
    }
  }

  private repositionPipes(width: number, height: number) {
    // Update pipe spawn position
    this.PIPE_RESPAWN_X = width + 100
    
    // Reposition existing pipes - check if pipes and children exist
    if (this.pipes && this.pipes.children && this.pipes.children.entries) {
      this.pipes.children.entries.forEach((pipe: any) => {
        if (pipe.x > width) {
          pipe.x = this.PIPE_RESPAWN_X
        }
      })
    }
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

    // Handle responsive canvas sizing
    this.handleResponsiveCanvas()

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
      this.background1 = this.add.tileSprite(400, 300, 800, 600, 'background_sprite')
      this.background2 = this.add.tileSprite(1200, 300, 800, 600, 'background_sprite')
      
      console.log('Scrolling background created with Background5.png')
    } else {
      // Create fallback background with night city theme colors
      this.background1 = this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)
      this.background2 = this.add.rectangle(1200, 300, 800, 600, 0x1a1a2e)
      
      // Add some stars for night effect
      for (let i = 0; i < 50; i++) {
        const star = this.add.circle(
          Phaser.Math.Between(0, 800), 
          Phaser.Math.Between(0, 400), 
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
        this.background1 = this.add.tileSprite(400, 300, 800, 600, 'background_sprite') as any
        this.background2 = this.add.tileSprite(1200, 300, 800, 600, 'background_sprite') as any
        
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

    // Create ground
    this.ground = this.add.rectangle(400, 580, 800, 40, 0x8B4513)
    this.ground.setScrollFactor(0)
    this.startScreenElements.push(this.ground)

    // Create bird for start screen (static, no physics)
    this.bird = this.add.sprite(200, 300, 'bird_default')
    this.bird.setScale(0.2)
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

    // Create title
    const title = this.add.text(400, 200, '🐦 SOLANA FLAPPY BIRD', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      fontFamily: 'Arial'
    })
    title.setOrigin(0.5, 0.5)
    title.setScrollFactor(0)
    this.startScreenElements.push(title)

    // Create start button
    const startButton = this.add.rectangle(400, 350, 200, 60, 0x00ff00)
    startButton.setScrollFactor(0)
    startButton.setInteractive()
    startButton.setStrokeStyle(4, 0x000000)
    this.startScreenElements.push(startButton)

    const startText = this.add.text(400, 350, 'START', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    startText.setOrigin(0.5, 0.5)
    startText.setScrollFactor(0)
    this.startScreenElements.push(startText)

    // Add hover effects
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x00cc00)
    })

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x00ff00)
    })

    // Start game when clicked
    startButton.on('pointerdown', () => {
      this.startGame()
    })

    // Instructions
    const instructions = this.add.text(400, 450, 'Tap to flap and avoid pipes!\nCollect SOL rewards by completing quests!', {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: 'Arial',
      align: 'center'
    })
    instructions.setOrigin(0.5, 0.5)
    instructions.setScrollFactor(0)
    this.startScreenElements.push(instructions)
  }

  private startGame() {
    // Hide start screen elements (but keep bird)
    this.startScreenElements.forEach(element => {
      if (element !== this.bird) {
        element.destroy()
      }
    })
    this.startScreenElements = []

    // Emit game start quest event
    console.log('🎮 Game started - emitting game_start quest event')
    this.emitQuestEvent('game_start', { timestamp: Date.now() })
    console.log('🎮 Game start quest event emitted')

    // Background music is handled globally, no need to start here

    // Initialize game
    this.isGameStarted = true
    this.initializeGame()
    
    // Set proper gravity immediately when game starts (like first time playing)
    if (this.bird && this.bird.body) {
      const gravityValue: number = (this.gameSettings?.gravity || this.GRAVITY) * 0.7 // Same as first flap
      ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(gravityValue)
      console.log('Gravity set immediately on game start:', gravityValue)
    }
  }

  private resetGameState() {
    console.log('Resetting game state...')
    
    // Reset game flags
    this.isGameOver = false
    this.isGameStarted = false
    this.score = 0
    this.pipesPassed = 0
    this.difficultyLevel = 0
    
    // Clear all active pipes
    this.activePipes.forEach(pipeSet => {
      this.destroyPipeSet(pipeSet)
    })
    this.activePipes = []
    
    // Clear all active obstacles
    this.activeObstacles.forEach(obstacle => {
      obstacle.sprite.destroy()
    })
    this.activeObstacles = []
    
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
    
    // Remove custom event listeners
    this.events.removeListener('flap')
    
    // Stop any active timers
    if (this.pipeTimer) {
      this.pipeTimer.destroy()
    }
    
    // Clear any active pipes
    this.activePipes = []
    
    // Reset world gravity to settings value
    if (this.physics && this.physics.world) {
      const gravityValue: number = this.gameSettings?.gravity || this.GRAVITY
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
        // Stop any existing velocity completely
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
        // Reset angular velocity
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setAngularVelocity(0)
        // Reset rotation
        this.bird.setRotation(0)
        // Reset position to center
        this.bird.setPosition(currentX, currentY)
        console.log('Bird physics initialized with zero gravity and velocity')
      }
      
      console.log('Bird converted from static to physics sprite')
    } else {
      // Create new bird if none exists
      this.bird = this.physics.add.sprite(200, 300, 'bird_default')
      this.bird.setScale(0.2)
      this.bird.setVisible(true)
      this.bird.setAlpha(1)
      
      if (this.bird.body) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setBounce(0.2)
        // Set gravity to 0 initially - will be set when game actually starts
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(0)
        // Stop any existing velocity
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
        // Reset angular velocity
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setAngularVelocity(0)
        // Reset rotation
        this.bird.setRotation(0)
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
    this.scoreText = this.add.text(400, 50, '0', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    })
    this.scoreText.setOrigin(0.5)

    // Difficulty text
    this.difficultyText = this.add.text(400, 100, 'Level 0', {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    })
    this.difficultyText.setOrigin(0.5)

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
    
    // Add mobile touch support
    this.input.on('pointerdown', this.flap, this)
    
    // Listen for flap events from mobile controls
    this.events.on('flap', this.flap, this)
    
    // Add restart input handlers
    this.input.keyboard?.on('keydown-R', this.handleRestart, this)
    this.input.keyboard?.on('keydown-ENTER', this.handleRestart, this)

    // Start spawning first pipe after a delay
    this.time.delayedCall(1000, () => {
      this.spawnPipe()
    })

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
    
    // Update obstacles movement and collision
    this.updateObstacles()
    
    // Check if we need to spawn new pipes
    this.checkPipeSpawning()

    // EXACT VISUAL COLLISION CHECK - Match exact pipe visual bounds
    for (let i = 0; i < this.activePipes.length; i++) {
      const pipeSet = this.activePipes[i]
      
      // Only check collision if pipe is close to bird (within 40 pixels)
      if (Math.abs(pipeSet.topPipe.x - this.bird.x) < 40) {
        // Get bird bounds - use exact visual bounds
        const birdBounds = this.bird.getBounds()
        
        // Create bird collision box that matches visual bird size exactly
        const birdCollisionBounds = new Phaser.Geom.Rectangle(
          birdBounds.x + 30, // Extra large margin from left (bird visual is much smaller than bounds)
          birdBounds.y + 30, // Extra large margin from top (bird visual is much smaller than bounds)
          birdBounds.width - 60, // Reduce width significantly (bird visual is much smaller)
          birdBounds.height - 60 // Reduce height significantly (bird visual is much smaller)
        )
        
        // Get pipe bounds - use exact visual bounds
        const topPipeBounds = pipeSet.topPipe.getBounds()
        const bottomPipeBounds = pipeSet.bottomPipe.getBounds()
        
        // Create pipe collision boxes that match visual pipe size exactly
        const topPipeCollisionBounds = new Phaser.Geom.Rectangle(
          topPipeBounds.x + 20, // Extra large margin to match visual pipe
          topPipeBounds.y + 20, // Extra large margin to match visual pipe
          topPipeBounds.width - 40, // Reduce width more
          topPipeBounds.height - 40 // Reduce height more
        )
        
        const bottomPipeCollisionBounds = new Phaser.Geom.Rectangle(
          bottomPipeBounds.x + 20, // Extra large margin to match visual pipe
          bottomPipeBounds.y + 20, // Extra large margin to match visual pipe
          bottomPipeBounds.width - 40, // Reduce width more
          bottomPipeBounds.height - 40 // Reduce height more
        )
        
        // Check collision with exact visual bounds
        const hitTopPipe = Phaser.Geom.Rectangle.Overlaps(birdCollisionBounds, topPipeCollisionBounds)
        const hitBottomPipe = Phaser.Geom.Rectangle.Overlaps(birdCollisionBounds, bottomPipeCollisionBounds)
        
        // Debug logging when pipe is very close
        if (Math.abs(pipeSet.topPipe.x - this.bird.x) < 25) {
          console.log('🔍 EXACT VISUAL COLLISION DEBUG:', {
            bird: {
              x: this.bird.x,
              y: this.bird.y,
              originalBounds: {
                x: birdBounds.x,
                y: birdBounds.y,
                width: birdBounds.width,
                height: birdBounds.height
              },
              visualCollisionBounds: {
                x: birdCollisionBounds.x,
                y: birdCollisionBounds.y,
                width: birdCollisionBounds.width,
                height: birdCollisionBounds.height
              },
              margin: '30px margin (matches visual bird exactly)'
            },
            pipes: {
              topPipe: {
                original: { x: topPipeBounds.x, y: topPipeBounds.y, width: topPipeBounds.width, height: topPipeBounds.height },
                visualCollision: { x: topPipeCollisionBounds.x, y: topPipeCollisionBounds.y, width: topPipeCollisionBounds.width, height: topPipeCollisionBounds.height }
              },
              bottomPipe: {
                original: { x: bottomPipeBounds.x, y: bottomPipeBounds.y, width: bottomPipeBounds.width, height: bottomPipeBounds.height },
                visualCollision: { x: bottomPipeCollisionBounds.x, y: bottomPipeCollisionBounds.y, width: bottomPipeCollisionBounds.width, height: bottomPipeCollisionBounds.height }
              }
            },
            collision: {
              hitTopPipe,
              hitBottomPipe,
              distanceToTopPipe: Math.abs(pipeSet.topPipe.x - this.bird.x)
            }
          })
        }
        
        if (hitTopPipe || hitBottomPipe) {
          console.log('🚨🚨🚨 EXACT VISUAL COLLISION DETECTED! 🚨🚨🚨')
          console.log('Hit top pipe:', hitTopPipe)
          console.log('Hit bottom pipe:', hitBottomPipe)
          console.log('Bird position:', { x: this.bird.x, y: this.bird.y })
          console.log('Collision matches visual bounds exactly')
          if (!this.isGameOver) {
            this.gameOver()
          }
          return
        }
      }
    }
    
    // Additional collision check for bird falling below screen
    if (this.bird && !this.isGameOver) {
      const birdBounds = this.bird.getBounds()
      const birdBottom = birdBounds.y + birdBounds.height - 30 // Use same margin as collision detection
      
      if (birdBottom > 600) {
        console.log('🚨 BIRD FELL BELOW SCREEN! Game Over!', { birdY: this.bird.y, birdBottom })
        if (!this.isGameOver) {
          this.gameOver()
        }
      }
    }
    
    // Additional collision check for bird hitting ceiling (top of screen)
    if (this.bird && !this.isGameOver) {
      const birdBounds = this.bird.getBounds()
      const birdTop = birdBounds.y + 30 // Bird top edge with same margin as collision detection
      
      if (birdTop <= 0) {
        console.log('🚨 BIRD HIT CEILING! Game Over!', { birdY: this.bird.y, birdTop })
        if (!this.isGameOver) {
          this.gameOver()
        }
      }
    }
    
    // Manual ground collision detection for more accuracy
    if (this.bird && !this.isGameOver) {
      const birdBounds = this.bird.getBounds()
      const birdBottom = birdBounds.y + birdBounds.height - 30 // Bird bottom edge with same margin as collision detection
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
      // Ensure gravity is set (should already be set in startGame, but just in case)
      if ((this.bird.body as Phaser.Physics.Arcade.Body).gravity.y === 0) {
        // Use reduced gravity for smoother gameplay
        const gravityValue: number = (this.gameSettings?.gravity || this.GRAVITY) * 0.7 // Reduce gravity by 30%
        ;(this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(gravityValue)
        console.log('Gravity activated on flap (fallback):', gravityValue)
      }
      
      // Use reduced flap force for smoother control
      const flapForce = this.FLAP_FORCE * 0.8 // Reduce flap force by 20%
      ;(this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(flapForce)
      
      // Play flap sound using audio manager
      if (this.audioManager) {
        this.audioManager.playFlapSound()
      }
    }
  }

  private handleRestart() {
    if (this.isGameOver) {
      console.log('Restarting game...')
      // Reset game state and go back to start screen
      this.resetGameState()
      this.createStartScreen()
    }
  }

  private getCurrentPipeSpacing(): number {
    // Calculate current pipe spacing based on difficulty level
    const progress = Math.min(this.difficultyLevel / 20, 1) // Max difficulty at level 20
    return this.BASE_PIPE_SPACING - (this.BASE_PIPE_SPACING - this.MIN_PIPE_SPACING) * progress
  }

  private getCurrentPipeGap(): number {
    // Calculate current pipe gap based on difficulty level
    const progress = Math.min(this.difficultyLevel / 15, 1) // Max difficulty at level 15
    return this.BASE_PIPE_GAP - (this.BASE_PIPE_GAP - this.MIN_PIPE_GAP) * progress
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
    
    // Don't spawn if we already have maximum pipes
    if (this.activePipes.length >= this.MAX_ACTIVE_PIPES) {
      return
    }
    
    // Spawn new pipes based on distance from the last pipe
    if (this.activePipes.length === 0) {
      // No pipes active, spawn immediately
      this.spawnPipe()
    } else {
      // Check if the last pipe has moved far enough to spawn a new one
      const lastPipe = this.activePipes[this.activePipes.length - 1]
      const distanceFromLastPipe = this.PIPE_RESPAWN_X - lastPipe.topPipe.x
      const currentSpacing = this.getCurrentPipeSpacing()
      
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
          pipeSet.topPipeCollision.forEach((collisionData: any) => {
            collisionData.x -= pipeSpeed
          })
        }
        if (pipeSet.bottomPipeCollision) {
          pipeSet.bottomPipeCollision.forEach((collisionData: any) => {
            collisionData.x -= pipeSpeed
          })
        }
        
        // Debug: Log collision data positions for collision detection
        if (Math.abs(pipeSet.topPipe.x - 200) < 50) { // When pipe is near bird
          console.log('🔍 COLLISION DATA POSITIONS:', {
            topPipe: {
              x: pipeSet.topPipe.x,
              y: pipeSet.topPipe.y,
              collisionData: pipeSet.topPipeCollision ? pipeSet.topPipeCollision.map((data: any, index: number) => ({ 
                index,
                x: data.x, 
                y: data.y,
                width: data.width,
                height: data.height
              })) : 'none'
            },
            bottomPipe: {
              x: pipeSet.bottomPipe.x,
              y: pipeSet.bottomPipe.y,
              collisionData: pipeSet.bottomPipeCollision ? pipeSet.bottomPipeCollision.map((data: any, index: number) => ({ 
                index,
                x: data.x, 
                y: data.y,
                width: data.width,
                height: data.height
              })) : 'none'
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

  private updateObstacles() {
    // Update each active obstacle
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obstacle = this.activeObstacles[i]
      
      if (!this.isGameOver) {
        const pipeSpeed = this.gameSettings?.pipeSpeed || this.PIPE_SPEED
        
        // Move obstacle with pipes
        obstacle.sprite.x -= pipeSpeed
        obstacle.collisionData.x -= pipeSpeed
        
        // Move moving obstacles vertically
        if (obstacle.type === 'moving_spike' && obstacle.speed > 0) {
          obstacle.sprite.y += obstacle.speed * obstacle.direction
          obstacle.collisionData.y += obstacle.speed * obstacle.direction
          
          // Reverse direction if hitting boundaries
          if (obstacle.sprite.y <= 50 || obstacle.sprite.y >= 500) {
            obstacle.direction *= -1
          }
        }
        
        // Check collision with bird using exact visual bounds (same as pipe collision)
        const birdBounds = this.bird.getBounds()
        const birdCollisionBounds = new Phaser.Geom.Rectangle(
          birdBounds.x + 30, // Extra large margin to match visual bird (same as pipe collision)
          birdBounds.y + 30, // Extra large margin to match visual bird (same as pipe collision)
          birdBounds.width - 60, // Reduce width significantly (same as pipe collision)
          birdBounds.height - 60 // Reduce height significantly (same as pipe collision)
        )
        
        const obstacleBounds = new Phaser.Geom.Rectangle(
          obstacle.collisionData.x,
          obstacle.collisionData.y,
          obstacle.collisionData.width,
          obstacle.collisionData.height
        )
        
        if (Phaser.Geom.Rectangle.Overlaps(birdCollisionBounds, obstacleBounds)) {
          console.log('🚨🚨🚨 OBSTACLE COLLISION DETECTED! 🚨🚨🚨')
          console.log('Obstacle type:', obstacle.type)
          if (!this.isGameOver) {
            this.gameOver()
          }
          return
        }
      }
      
      // Remove obstacles that are off screen
      if (obstacle.sprite.x < -100) {
        obstacle.sprite.destroy()
        this.activeObstacles.splice(i, 1)
      }
    }
  }

  private checkPipeCollision(pipeSet: any): boolean {
    if (!this.bird || this.isGameOver) return false
    
    // Use Phaser's built-in collision detection for accuracy
    const birdBounds = this.bird.getBounds()
    const topPipeBounds = pipeSet.topPipe.getBounds()
    const bottomPipeBounds = pipeSet.bottomPipe.getBounds()
    
    // Check collision using Phaser's bounds intersection
    const hitTopPipe = Phaser.Geom.Rectangle.Overlaps(birdBounds, topPipeBounds)
    const hitBottomPipe = Phaser.Geom.Rectangle.Overlaps(birdBounds, bottomPipeBounds)
    
    // Debug logging
    if (Math.abs(this.bird.x - pipeSet.topPipe.x) < 100 || Math.abs(this.bird.x - pipeSet.bottomPipe.x) < 100) {
      console.log('🔍 PHASER COLLISION DEBUG:', {
        bird: { x: this.bird.x, y: this.bird.y },
        birdBounds: {
          x: birdBounds.x,
          y: birdBounds.y,
          width: birdBounds.width,
          height: birdBounds.height
        },
        topPipeBounds: {
          x: topPipeBounds.x,
          y: topPipeBounds.y,
          width: topPipeBounds.width,
          height: topPipeBounds.height
        },
        bottomPipeBounds: {
          x: bottomPipeBounds.x,
          y: bottomPipeBounds.y,
          width: bottomPipeBounds.width,
          height: bottomPipeBounds.height
        },
        hitTopPipe,
        hitBottomPipe,
        phaserOverlap: {
          top: Phaser.Geom.Rectangle.Overlaps(birdBounds, topPipeBounds),
          bottom: Phaser.Geom.Rectangle.Overlaps(birdBounds, bottomPipeBounds)
        }
      })
    }
    
    if (hitTopPipe || hitBottomPipe) {
      console.log('💥💥💥 PHASER COLLISION DETECTED! 💥💥💥')
      console.log('Hit top pipe:', hitTopPipe)
      console.log('Hit bottom pipe:', hitBottomPipe)
      return true
    }
    
    return false
  }

  private checkBoundsOverlap(bounds1: any, bounds2: any): boolean {
    return bounds1.left < bounds2.right && 
           bounds1.right > bounds2.left && 
           bounds1.top < bounds2.bottom && 
           bounds1.bottom > bounds2.top
  }

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

    const gap = this.getCurrentPipeGap()
    const pipeHeight = Phaser.Math.Between(200, 300)
    const x = this.PIPE_RESPAWN_X

    console.log(`Spawning new pipe set at x: ${x}, height: ${pipeHeight}, gap: ${Math.round(gap)}, difficulty: ${this.difficultyLevel}`)

    // Determine which pipe sprite to use
    const pipeSpriteKey = this.getPipeSpriteKey()
    
    // Create top pipe using the selected sprite
    // Position it so the bottom of the flipped pipe is at pipeHeight
    const topPipe = this.add.image(x, pipeHeight, pipeSpriteKey)
    topPipe.setScale(1, -1)  // Flip vertically
    topPipe.setOrigin(0, 0)  // Set origin to top-left of the flipped pipe
    
    console.log(`Top pipe created at x: ${x}, y: ${pipeHeight} using sprite: ${pipeSpriteKey}`)

    // Create bottom pipe using the selected sprite
    const bottomPipe = this.add.image(x, pipeHeight + gap, pipeSpriteKey)
    bottomPipe.setOrigin(0, 0)

    // Calculate collision bounds for invisible collision detection
    const pipeWidth = topPipe.width
    const pipeHeightValue = topPipe.height
    
    // Get the actual bounds that Phaser will use for collision detection
    // Top pipe bounds (flipped pipe - extends upward from y position)
    const topPipeLeft = x
    const topPipeRight = x + pipeWidth
    const topPipeTop = pipeHeight - pipeHeightValue // Top pipe extends upward
    const topPipeBottom = pipeHeight
    
    // Bottom pipe bounds
    const bottomPipeLeft = x
    const bottomPipeRight = x + pipeWidth
    const bottomPipeTop = pipeHeight + gap
    const bottomPipeBottom = pipeHeight + gap + pipeHeightValue
    
    // Create invisible collision rectangles for collision detection
    const topPipeCollisionTop = { x: topPipeLeft + pipeWidth/2, y: topPipeTop, width: pipeWidth, height: 2 }
    const topPipeCollisionBottom = { x: topPipeLeft + pipeWidth/2, y: topPipeBottom, width: pipeWidth, height: 2 }
    const topPipeCollisionLeft = { x: topPipeLeft, y: topPipeTop + pipeHeightValue/2, width: 2, height: pipeHeightValue }
    const topPipeCollisionRight = { x: topPipeRight, y: topPipeTop + pipeHeightValue/2, width: 2, height: pipeHeightValue }
    
    const bottomPipeCollisionTop = { x: bottomPipeLeft + pipeWidth/2, y: bottomPipeTop, width: pipeWidth, height: 2 }
    const bottomPipeCollisionBottom = { x: bottomPipeLeft + pipeWidth/2, y: bottomPipeBottom, width: pipeWidth, height: 2 }
    const bottomPipeCollisionLeft = { x: bottomPipeLeft, y: bottomPipeTop + pipeHeightValue/2, width: 2, height: pipeHeightValue }
    const bottomPipeCollisionRight = { x: bottomPipeRight, y: bottomPipeTop + pipeHeightValue/2, width: 2, height: pipeHeightValue }

    // Create pipe set object
    const pipeSet = {
      topPipe: topPipe,
      bottomPipe: bottomPipe,
      // Store invisible collision data for collision detection
      topPipeCollision: [topPipeCollisionTop, topPipeCollisionBottom, topPipeCollisionLeft, topPipeCollisionRight],
      bottomPipeCollision: [bottomPipeCollisionTop, bottomPipeCollisionBottom, bottomPipeCollisionLeft, bottomPipeCollisionRight],
      scored: false
    }

    // Add to active pipes
    this.activePipes.push(pipeSet)
    
    console.log(`New pipe set created with invisible collision detection. Total active pipes: ${this.activePipes.length}`)
    
    // Add random obstacles to make the game more challenging
    this.spawnRandomObstacles(x, pipeHeight, gap)
  }

  private spawnRandomObstacles(pipeX: number, pipeHeight: number, gap: number) {
    // Only add obstacles for higher difficulty levels
    if (this.difficultyLevel < 2) return
    
    const obstacleTypes = ['spike', 'block', 'moving_spike']
    const numObstacles = Phaser.Math.Between(1, 3) // 1-3 obstacles per pipe set
    
    for (let i = 0; i < numObstacles; i++) {
      const obstacleType = Phaser.Math.RND.pick(obstacleTypes)
      const obstacleX = pipeX + Phaser.Math.Between(-50, 50) // Random X position near pipe
      
      let obstacleY: number
      let obstacleHeight: number
      let obstacleWidth: number
      
      // Randomly place obstacles above or below the gap
      if (Math.random() < 0.5) {
        // Above the gap (between top pipe and ceiling)
        obstacleY = Phaser.Math.Between(50, pipeHeight - 100)
      } else {
        // Below the gap (between bottom pipe and ground)
        obstacleY = pipeHeight + gap + Phaser.Math.Between(50, 100)
      }
      
      // Create obstacle based on type
      switch (obstacleType) {
        case 'spike':
          obstacleWidth = Phaser.Math.Between(20, 40)
          obstacleHeight = Phaser.Math.Between(15, 30)
          break
        case 'block':
          obstacleWidth = Phaser.Math.Between(30, 50)
          obstacleHeight = Phaser.Math.Between(20, 40)
          break
        case 'moving_spike':
          obstacleWidth = Phaser.Math.Between(15, 25)
          obstacleHeight = Phaser.Math.Between(10, 20)
          break
        default:
          obstacleWidth = 30
          obstacleHeight = 20
      }
      
      // Create obstacle sprite (using a simple colored rectangle for now)
      const obstacleColor = obstacleType === 'spike' ? 0xff4444 : 
                           obstacleType === 'block' ? 0x4444ff : 0xffaa44
      
      const obstacle = this.add.rectangle(obstacleX, obstacleY, obstacleWidth, obstacleHeight, obstacleColor)
      obstacle.setOrigin(0, 0)
      
      // Add collision data for the obstacle
      const obstacleCollisionData = {
        x: obstacleX,
        y: obstacleY,
        width: obstacleWidth,
        height: obstacleHeight
      }
      
      // Store obstacle data
      const obstacleData = {
        sprite: obstacle,
        type: obstacleType,
        collisionData: obstacleCollisionData,
        speed: obstacleType === 'moving_spike' ? Phaser.Math.Between(1, 3) : 0,
        direction: Math.random() < 0.5 ? 1 : -1 // Random direction for moving obstacles
      }
      
      this.activeObstacles.push(obstacleData)
    }
    
    console.log(`Spawned ${numObstacles} random obstacles for pipe at x: ${pipeX}`)
  }

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
    
    // Play game over sound using audio manager
    if (this.audioManager) {
      this.audioManager.playGameOverSound()
    }

    // Keep pipes visible for background context - don't clear them
    // this.activePipes.forEach(pipeSet => this.destroyPipeSet(pipeSet))
    // this.activePipes = []

    // Stop bird physics and freeze at collision position
    if (this.bird.body) {
      const body = this.bird.body as Phaser.Physics.Arcade.Body
      body.setVelocity(0, 0)
      body.setGravityY(0)
      body.setImmovable(true) // Make bird immovable
      body.setCollideWorldBounds(false) // Disable world bounds collision
    }
    
    // Stop world gravity to prevent bird from falling
    this.physics.world.gravity.y = 0
    console.log('World gravity stopped for game over')
    
    // Make bird non-interactive and remove input handlers
    this.bird.setInteractive(false)
    this.bird.removeInteractive()
    
    // Disable all input to prevent input errors
    this.input.enabled = false
    
    // Add visual effect to show bird is frozen
    this.bird.setTint(0x888888) // Make bird slightly grayed out
    this.bird.setAlpha(0.8) // Slightly transparent

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
    // Create popup background (very transparent to show game background clearly)
    const popupBg = this.add.rectangle(400, 300, 350, 280, 0x2C2C2C, 0.2)
    popupBg.setStrokeStyle(3, 0x444444)
    popupBg.setOrigin(0.5)
    
    // Add subtle shadow effect
    const shadow = this.add.rectangle(403, 303, 350, 280, 0x000000, 0.05)
    shadow.setOrigin(0.5)
    shadow.setDepth(-1)
    
    // Game Over title
    const gameOverText = this.add.text(400, 220, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    gameOverText.setOrigin(0.5)
    
    // Score display
    const scoreText = this.add.text(400, 260, `Your Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    })
    scoreText.setOrigin(0.5)
    
    // High score display (you can implement high score tracking later)
    const highScoreText = this.add.text(400, 290, `High Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    })
    highScoreText.setOrigin(0.5)
    
    // Large START button (like in the original start screen)
    const startBtn = this.add.rectangle(400, 330, 200, 60, 0x00ff00)
    startBtn.setStrokeStyle(4, 0x000000)
    startBtn.setInteractive()
    
    const startText = this.add.text(400, 330, 'START', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    startText.setOrigin(0.5)
    
    // Add hover effects for START button
    startBtn.on('pointerover', () => {
      startBtn.setFillStyle(0x00cc00)
    })
    
    startBtn.on('pointerout', () => {
      startBtn.setFillStyle(0x00ff00)
    })
    
    startBtn.on('pointerdown', () => {
      this.handleRestart()
    })
    
    // Main Menu button
    const mainMenuBtn = this.add.rectangle(400, 400, 200, 40, 0x666666)
    mainMenuBtn.setStrokeStyle(2, 0x888888)
    mainMenuBtn.setInteractive()
    
    const mainMenuText = this.add.text(400, 400, 'Main Menu', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    mainMenuText.setOrigin(0.5)
    
    // Re-enable input for button interactions
    this.input.enabled = true
    
    // Button interactions (START button interactions are already handled above)
    
    mainMenuBtn.on('pointerdown', () => {
      console.log('Main Menu clicked')
      this.game.events.emit('backToMenu')
    })
    
    mainMenuBtn.on('pointerover', () => {
      mainMenuBtn.setFillStyle(0x888888)
    })
    
    mainMenuBtn.on('pointerout', () => {
      mainMenuBtn.setFillStyle(0x666666)
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
}

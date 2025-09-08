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
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
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
  private readonly GRAVITY = 1000
  private readonly FLAP_FORCE = -400
  private readonly PIPE_SPEED = 3  // Slower speed for better visibility
  private readonly PIPE_SPAWN_DELAY = 2000  // Shorter delay between pipes (2 seconds)
  private readonly PIPE_RESPAWN_X = 800
  private readonly BASE_PIPE_SPACING = 400  // Base distance between pipe sets (in pixels)
  private readonly MIN_PIPE_SPACING = 200   // Minimum distance (gets closer over time)
  private readonly MAX_ACTIVE_PIPES = 3  // Maximum number of pipe sets on screen
  private readonly BASE_PIPE_GAP = 150  // Base gap between pipes
  private readonly MIN_PIPE_GAP = 80    // Minimum gap (gets smaller over time)
  
  // Track scored pipes to prevent multiple scoring
  private scoredPipes: Set<any> = new Set()
  
  // Pipe management
  private activePipes: any[] = [] // Track active pipe sets
  private lastPipeSpawnTime: number = 0
  
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
        musicEnabled: settings.musicEnabled,
        soundVolume: settings.soundVolume,
        musicVolume: settings.musicVolume
      }
      this.audioManager.updateConfig(audioConfig)
    }
  }

  private applySettings() {
    if (!this.gameSettings) return

    // Apply physics settings
    if (this.physics && this.physics.world) {
      this.physics.world.gravity.y = this.gameSettings.gravity
    }

    // Apply audio settings
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
    })
    this.load.start()

    // Initialize audio manager
    this.initializeAudio()

    // Create start screen first
    this.createStartScreen()
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
      }
    }
    
    // Apply cosmetic if selected, otherwise use default
    if (this.selectedCosmetic) {
      console.log(`Applying selected cosmetic: ${this.selectedCosmetic}`)
      this.applyCosmetic(this.selectedCosmetic)
    } else {
      console.log('No cosmetic selected, using default bird (Bird2-export.png)')
      this.bird.setTexture('bird_default')
    }

    // If bird texture doesn't exist, create a placeholder
    if (!this.textures.exists('bird_default')) {
      console.log('Bird2-export.png not loaded, creating placeholder')
      this.createDefaultBird()
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
      console.log('Bird hit ground! Game Over!')
      if (!this.isGameOver) {
        this.gameOver()
      }
    }, undefined, this)

    // Input - only for flapping during gameplay
    this.input.keyboard?.on('keydown-SPACE', this.flap, this)
    this.input.keyboard?.on('keydown-UP', this.flap, this)
    this.input.on('pointerdown', this.flap, this)
    
    // Add restart input handlers
    this.input.keyboard?.on('keydown-R', this.handleRestart, this)
    this.input.keyboard?.on('keydown-ENTER', this.handleRestart, this)

    // Start spawning first pipe after a delay
    this.time.delayedCall(2000, () => {
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
    
    // Check if we need to spawn new pipes
    this.checkPipeSpawning()

    // Additional collision check for bird falling below screen
    if (this.bird.y > 600) {
      console.log('Bird fell below screen! Game Over!')
      if (!this.isGameOver) {
        this.gameOver()
      }
    }
    
    // Additional collision check for bird hitting ceiling (top of screen)
    if (this.bird.y < 0) {
      console.log('Bird hit ceiling! Game Over!')
      if (!this.isGameOver) {
        this.gameOver()
      }
    }
    
    // Manual ground collision detection for more accuracy
    if (this.bird && !this.isGameOver) {
      const birdBottom = this.bird.y + 25 // Bird bottom edge
      const groundTop = 580 // Ground top edge (ground is at y: 580, height: 40)
      
      if (birdBottom >= groundTop) {
        console.log('Manual ground collision detected! Bird hit ground! Game Over!')
        if (!this.isGameOver) {
          this.gameOver()
        }
      }
    }
  }

  private flap() {
    if (this.isGameOver || !this.isGameStarted) return

    if (this.bird.body) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(this.FLAP_FORCE)
      
      // Play flap sound using audio manager
      if (this.audioManager) {
        this.audioManager.playFlapSound()
      }
    }
  }

  private handleRestart() {
    if (this.isGameOver) {
      console.log('Restarting game...')
      // Reset game state and start fresh
      this.resetGameState()
      // Don't call createStartScreen() here as it will be called by startGame()
      // Just reset the state and let the game over popup handle the restart
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
      }
      
      // Check for scoring when pipes pass the bird (only once per pipe set)
      if (pipeSet.topPipe.x <= 200 && !pipeSet.scored) {
        this.scorePoint()
        pipeSet.scored = true
        this.pipesPassed++
        this.updateDifficulty()
        console.log(`Scored! Pipe set at x: ${pipeSet.topPipe.x}, total score: ${this.score}, pipes passed: ${this.pipesPassed}`)
      }
      
      // Check collision with bird
      if (this.checkPipeCollision(pipeSet)) {
        console.log('Bird hit pipe! Game Over!')
        if (!this.isGameOver) {
          this.gameOver()
        }
        return
      }
      
      // Remove pipes that are off screen
      if (pipeSet.topPipe.x < -100) {
        this.destroyPipeSet(pipeSet)
        this.activePipes.splice(i, 1)
        console.log(`Pipe set destroyed and removed. Active pipes: ${this.activePipes.length}`)
      }
    }
  }

  private checkPipeCollision(pipeSet: any): boolean {
    if (!this.bird || this.isGameOver) return false
    
    // Make bird collision bounds more reasonable for gameplay
    const birdRadius = 12 // Slightly larger for more forgiving collision
    const birdBounds = {
      left: this.bird.x - birdRadius,
      right: this.bird.x + birdRadius,
      top: this.bird.y - birdRadius,
      bottom: this.bird.y + birdRadius
    }
    
    // Check collision with top pipe
    // Top pipe is positioned with setOrigin(0, 0) and setScale(1, -1)
    // This means it's flipped vertically and anchored at top-left
    // Using actual Sprite-0003.png dimensions for precise collision
    const pipeWidth = 80  // Sprite-0003.png actual width
    const pipeHeight = 400  // Sprite-0003.png actual height
    
    // Add small margin for more forgiving collision detection
    const pipeMargin = 3 // Small margin for more forgiving collision
    const topPipeBounds = {
      left: pipeSet.topPipe.x + pipeMargin,
      right: pipeSet.topPipe.x + pipeWidth - pipeMargin,
      top: pipeSet.topPipe.y - pipeHeight + pipeMargin, // Top pipe visual top (extends upward from y position)
      bottom: pipeSet.topPipe.y - pipeMargin     // Top pipe visual bottom (at y position)
    }
    
    // Check collision with bottom pipe
    const bottomPipeBounds = {
      left: pipeSet.bottomPipe.x + pipeMargin,
      right: pipeSet.bottomPipe.x + pipeWidth - pipeMargin,
      top: pipeSet.bottomPipe.y + pipeMargin,
      bottom: pipeSet.bottomPipe.y + pipeHeight - pipeMargin
    }
    
    const hitTop = this.checkBoundsOverlap(birdBounds, topPipeBounds)
    const hitBottom = this.checkBoundsOverlap(birdBounds, bottomPipeBounds)
    
    // Enhanced debugging for collision detection
    if (hitTop) {
      console.log('💥 COLLISION with TOP pipe detected!')
      console.log('Bird position:', { x: this.bird.x, y: this.bird.y })
      console.log('Bird radius:', birdRadius, 'pixels (forgiving collision)')
      console.log('Bird bounds:', birdBounds)
      console.log('Top pipe bounds:', topPipeBounds)
      console.log('Top pipe position:', { x: pipeSet.topPipe.x, y: pipeSet.topPipe.y })
      console.log('Pipe margin:', pipeMargin, 'pixels (forgiving collision)')
    }
    if (hitBottom) {
      console.log('💥 COLLISION with BOTTOM pipe detected!')
      console.log('Bird position:', { x: this.bird.x, y: this.bird.y })
      console.log('Bird radius:', birdRadius, 'pixels (forgiving collision)')
      console.log('Bird bounds:', birdBounds)
      console.log('Bottom pipe bounds:', bottomPipeBounds)
      console.log('Bottom pipe position:', { x: pipeSet.bottomPipe.x, y: pipeSet.bottomPipe.y })
      console.log('Pipe margin:', pipeMargin, 'pixels (forgiving collision)')
    }
    
    // Check overlap with either pipe
    return hitTop || hitBottom
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

    // Don't spawn if we already have too many pipes
    if (this.activePipes.length >= this.MAX_ACTIVE_PIPES) {
      return
    }

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

    // Create pipe set object
    const pipeSet = {
      topPipe: topPipe,
      bottomPipe: bottomPipe,
      scored: false
    }

    // Add to active pipes
    this.activePipes.push(pipeSet)
    
    console.log(`New pipe set created with sprite. Total active pipes: ${this.activePipes.length}`)
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
    
    console.log('GAME OVER - Score:', this.score)

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
    // Clear any existing game over popup elements first
    this.children.list.forEach(child => {
      if (child.name && child.name.includes('gameOver')) {
        child.destroy()
      }
    })
    
    // Create popup background (very transparent to show game background clearly)
    const popupBg = this.add.rectangle(400, 300, 350, 280, 0x2C2C2C, 0.2)
    popupBg.setStrokeStyle(3, 0x444444)
    popupBg.setOrigin(0.5)
    popupBg.name = 'gameOver_popupBg'
    
    // Add subtle shadow effect
    const shadow = this.add.rectangle(403, 303, 350, 280, 0x000000, 0.05)
    shadow.setOrigin(0.5)
    shadow.setDepth(-1)
    shadow.name = 'gameOver_shadow'
    
    // Game Over title
    const gameOverText = this.add.text(400, 220, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff4444',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    gameOverText.setOrigin(0.5)
    gameOverText.name = 'gameOver_title'
    
    // Score display
    const scoreText = this.add.text(400, 260, `Your Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    })
    scoreText.setOrigin(0.5)
    scoreText.name = 'gameOver_score'
    
    // High score display (you can implement high score tracking later)
    const highScoreText = this.add.text(400, 290, `High Score: ${this.score}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    })
    highScoreText.setOrigin(0.5)
    highScoreText.name = 'gameOver_highScore'
    
    // Large START button (like in the original start screen)
    const startBtn = this.add.rectangle(400, 330, 200, 60, 0x00ff00)
    startBtn.setStrokeStyle(4, 0x000000)
    startBtn.setInteractive()
    startBtn.name = 'gameOver_startBtn'
    
    const startText = this.add.text(400, 330, 'START', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    startText.setOrigin(0.5)
    startText.name = 'gameOver_startText'
    
    // Add hover effects for START button
    startBtn.on('pointerover', () => {
      startBtn.setFillStyle(0x00cc00)
    })
    
    startBtn.on('pointerout', () => {
      startBtn.setFillStyle(0x00ff00)
    })
    
    startBtn.on('pointerdown', () => {
      this.startGame()
    })
    
    // Main Menu button
    const mainMenuBtn = this.add.rectangle(400, 400, 200, 40, 0x666666)
    mainMenuBtn.setStrokeStyle(2, 0x888888)
    mainMenuBtn.setInteractive()
    mainMenuBtn.name = 'gameOver_mainMenuBtn'
    
    const mainMenuText = this.add.text(400, 400, 'Main Menu', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
    mainMenuText.setOrigin(0.5)
    mainMenuText.name = 'gameOver_mainMenuText'
    
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
    // Sound system temporarily disabled to avoid errors
    // You can add actual audio files later
    console.log('Sound system disabled - add audio files to enable')
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
    
    // Map cosmetic IDs to pipe sprite keys
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

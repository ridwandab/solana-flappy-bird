import { createClient } from '@supabase/supabase-js'

// Database Manager untuk multiple database support
export interface DatabaseConfig {
  type: 'supabase' | 'localStorage' | 'firebase' | 'mongodb'
  url?: string
  key?: string
  config?: any
}

export interface HighScoreEntry {
  id: string
  player_address: string
  player_name: string
  score: number
  timestamp: string
  created_at: string
}

class DatabaseManager {
  private config: DatabaseConfig
  private supabase: any = null

  constructor(config: DatabaseConfig) {
    this.config = config
    this.initialize()
  }

  private initialize() {
    switch (this.config.type) {
      case 'supabase':
        if (this.config.url && this.config.key) {
          this.supabase = createClient(this.config.url, this.config.key)
        }
        break
      case 'localStorage':
        // localStorage sudah tersedia di browser
        break
      default:
        console.warn('Database type not supported:', this.config.type)
    }
  }

  async saveHighScore(playerAddress: string, score: number, playerName: string): Promise<HighScoreEntry | null> {
    const entry: HighScoreEntry = {
      id: `${playerAddress}_${Date.now()}`,
      player_address: playerAddress,
      player_name: playerName,
      score: score,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    switch (this.config.type) {
      case 'supabase':
        return await this.saveToSupabase(entry)
      case 'localStorage':
        return await this.saveToLocalStorage(entry)
      default:
        return await this.saveToLocalStorage(entry)
    }
  }

  async getHighScores(limit: number = 100): Promise<HighScoreEntry[]> {
    switch (this.config.type) {
      case 'supabase':
        return await this.getFromSupabase(limit)
      case 'localStorage':
        return await this.getFromLocalStorage(limit)
      default:
        return await this.getFromLocalStorage(limit)
    }
  }

  private async saveToSupabase(entry: HighScoreEntry): Promise<HighScoreEntry | null> {
    if (!this.supabase) {
      console.warn('Supabase not initialized')
      return null
    }

    try {
      const { data, error } = await this.supabase
        .from('high_scores')
        .insert([entry])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Supabase save error:', error)
      // Fallback to localStorage
      return await this.saveToLocalStorage(entry)
    }
  }

  private async getFromSupabase(limit: number): Promise<HighScoreEntry[]> {
    if (!this.supabase) {
      console.warn('Supabase not initialized')
      return []
    }

    try {
      const { data, error } = await this.supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Supabase get error:', error)
      // Fallback to localStorage
      return await this.getFromLocalStorage(limit)
    }
  }

  private async saveToLocalStorage(entry: HighScoreEntry): Promise<HighScoreEntry> {
    try {
      // Save individual entry
      const key = `leaderboard_${entry.player_address}_${Date.now()}`
      localStorage.setItem(key, JSON.stringify(entry))

      // Update high scores array
      const existingScores = localStorage.getItem('flappyBirdHighScores')
      let scores = existingScores ? JSON.parse(existingScores) : []
      
      scores.push(entry)
      scores.sort((a: HighScoreEntry, b: HighScoreEntry) => b.score - a.score)
      scores = scores.slice(0, 100) // Keep top 100
      
      localStorage.setItem('flappyBirdHighScores', JSON.stringify(scores))
      
      console.log('High score saved to localStorage:', entry)
      return entry
    } catch (error) {
      console.error('localStorage save error:', error)
      return entry
    }
  }

  private async getFromLocalStorage(limit: number): Promise<HighScoreEntry[]> {
    try {
      const scores = localStorage.getItem('flappyBirdHighScores')
      if (!scores) return []
      
      const parsedScores = JSON.parse(scores)
      return parsedScores.slice(0, limit)
    } catch (error) {
      console.error('localStorage get error:', error)
      return []
    }
  }

  isAvailable(): boolean {
    switch (this.config.type) {
      case 'supabase':
        return this.supabase !== null
      case 'localStorage':
        return typeof localStorage !== 'undefined'
      default:
        return false
    }
  }

  getType(): string {
    return this.config.type
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager({
  type: 'localStorage', // Default to localStorage
  // type: 'supabase',
  // url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  // key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export default DatabaseManager

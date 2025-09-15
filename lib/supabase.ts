import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key'

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null
}

// Database types
export interface Database {
  public: {
    Tables: {
      high_scores: {
        Row: {
          id: string
          player_address: string
          player_name: string
          score: number
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          player_address: string
          player_name: string
          score: number
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          player_address?: string
          player_name?: string
          score?: number
          timestamp?: string
          created_at?: string
        }
      }
      player_names: {
        Row: {
          id: string
          player_address: string
          player_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_address: string
          player_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_address?: string
          player_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_cosmetics: {
        Row: {
          id: string
          player_address: string
          cosmetic_id: string
          purchased_at: string
          transaction_signature: string
        }
        Insert: {
          id?: string
          player_address: string
          cosmetic_id: string
          purchased_at?: string
          transaction_signature: string
        }
        Update: {
          id?: string
          player_address?: string
          cosmetic_id?: string
          purchased_at?: string
          transaction_signature?: string
        }
      }
      cosmetics: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          rarity: string
          type: string
          image_url: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          rarity: string
          type: string
          image_url?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          rarity?: string
          type?: string
          image_url?: string
          is_active?: boolean
        }
      }
    }
  }
}

// Helper functions for database operations
export const saveHighScore = async (playerAddress: string, playerName: string, score: number) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, skipping database save')
    return null
  }

  const { data, error } = await supabase!
    .from('high_scores')
    .insert([
      {
        player_address: playerAddress,
        player_name: playerName,
        score: score,
        timestamp: new Date().toISOString(),
      }
    ])
    .select()

  if (error) throw error
  return data
}

export const savePlayerName = async (playerAddress: string, playerName: string) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, skipping player name save')
    return null
  }

  const { data, error } = await supabase!
    .from('player_names')
    .upsert([
      {
        player_address: playerAddress,
        player_name: playerName,
        updated_at: new Date().toISOString(),
      }
    ])
    .select()

  if (error) throw error
  return data
}

export const getPlayerName = async (playerAddress: string): Promise<string | null> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, returning null')
    return null
  }

  const { data, error } = await supabase!
    .from('player_names')
    .select('player_name')
    .eq('player_address', playerAddress)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error getting player name:', error)
    return null
  }

  return data?.player_name || null
}

export const getHighScores = async (limit: number = 100) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, returning empty array')
    return []
  }

  const { data, error } = await supabase!
    .from('high_scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export const getUserCosmetics = async (playerAddress: string) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, returning empty array')
    return []
  }

  const { data, error } = await supabase!
    .from('user_cosmetics')
    .select('cosmetic_id')
    .eq('player_address', playerAddress)

  if (error) throw error
  return data.map(item => item.cosmetic_id)
}

export const saveCosmeticPurchase = async (
  playerAddress: string,
  cosmeticId: string,
  transactionSignature: string
) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, skipping cosmetic purchase save')
    return null
  }

  const { data, error } = await supabase!
    .from('user_cosmetics')
    .insert([
      {
        player_address: playerAddress,
        cosmetic_id: cosmeticId,
        transaction_signature: transactionSignature,
        purchased_at: new Date().toISOString(),
      }
    ])
    .select()

  if (error) throw error
  return data
}

export const getCosmetics = async () => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured, returning empty array')
    return []
  }

  const { data, error } = await supabase!
    .from('cosmetics')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) throw error
  return data
}

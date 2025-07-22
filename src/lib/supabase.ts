import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface UserStats {
  id: string
  user_id: string
  games_played: number
  games_won: number
  total_moves: number
  best_time: number | null
  current_streak: number
  longest_streak: number
  created_at: string
  updated_at: string
}

export interface GameSession {
  id: string
  user_id: string
  moves: number
  time_seconds: number
  won: boolean
  completed_at: string
}

// Calculated stats for display
export interface DisplayStats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  averageMoves: number
  bestTime: number | null
  currentStreak: number
  longestStreak: number
}
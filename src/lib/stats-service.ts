import { supabase, UserStats, GameSession, DisplayStats } from './supabase'

export class StatsService {
  /**
   * Get user statistics for display
   */
  static async getUserStats(userId: string): Promise<DisplayStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No stats found, return zeros
          return {
            gamesPlayed: 0,
            gamesWon: 0,
            winPercentage: 0,
            averageMoves: 0,
            bestTime: null,
            currentStreak: 0,
            longestStreak: 0
          }
        }
        throw error
      }

      const stats: UserStats = data
      return {
        gamesPlayed: stats.games_played,
        gamesWon: stats.games_won,
        winPercentage: stats.games_played > 0 
          ? Math.round((stats.games_won / stats.games_played) * 100 * 10) / 10 
          : 0,
        averageMoves: stats.games_played > 0 
          ? Math.round(stats.total_moves / stats.games_played)
          : 0,
        bestTime: stats.best_time,
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return null
    }
  }

  /**
   * Record a completed game session
   */
  static async recordGameSession(
    userId: string, 
    moves: number, 
    timeSeconds: number, 
    won: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: userId,
          moves,
          time_seconds: timeSeconds,
          won
        })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error recording game session:', error)
      return false
    }
  }

  /**
   * Get recent game sessions for display
   */
  static async getRecentSessions(userId: string, limit: number = 5): Promise<GameSession[]> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
      return []
    }
  }

  /**
   * Initialize user stats if they don't exist
   */
  static async initializeUserStats(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          games_played: 0,
          games_won: 0,
          total_moves: 0,
          best_time: null,
          current_streak: 0,
          longest_streak: 0
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error initializing user stats:', error)
      return false
    }
  }
}
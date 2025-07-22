import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.email

    // Fetch user stats
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No stats found, return zeros
        return NextResponse.json({
          gamesPlayed: 0,
          gamesWon: 0,
          winPercentage: 0,
          averageMoves: 0,
          bestTime: null,
          currentStreak: 0,
          longestStreak: 0
        })
      }
      throw error
    }

    // Transform data for display
    const displayStats = {
      gamesPlayed: data.games_played,
      gamesWon: data.games_won,
      winPercentage: data.games_played > 0 
        ? Math.round((data.games_won / data.games_played) * 100 * 10) / 10 
        : 0,
      averageMoves: data.games_played > 0 
        ? Math.round(data.total_moves / data.games_played)
        : 0,
      bestTime: data.best_time,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak
    }

    return NextResponse.json(displayStats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.email
    const { moves, timeSeconds, won } = await request.json()

    // Validate input
    if (typeof moves !== 'number' || typeof timeSeconds !== 'number' || typeof won !== 'boolean') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Insert game session
    const { error } = await supabaseAdmin
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording game session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
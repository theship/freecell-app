-- User Statistics Tables for Freecell Game
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ectakysiowwezlmjpefg/sql

-- User statistics summary table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_moves INTEGER DEFAULT 0,
  best_time INTEGER, -- in seconds
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual game sessions for detailed tracking
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  moves INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed_at ON game_sessions(completed_at);

-- Add Row Level Security (RLS) policies
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/modify their own stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can only see/add their own game sessions
CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Function to automatically update user_stats when a game_session is added
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, games_played, games_won, total_moves, best_time, current_streak, longest_streak)
  VALUES (NEW.user_id, 1, CASE WHEN NEW.won THEN 1 ELSE 0 END, NEW.moves, 
          CASE WHEN NEW.won THEN NEW.time_seconds ELSE NULL END,
          CASE WHEN NEW.won THEN 1 ELSE 0 END,
          CASE WHEN NEW.won THEN 1 ELSE 0 END)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    games_played = user_stats.games_played + 1,
    games_won = user_stats.games_won + CASE WHEN NEW.won THEN 1 ELSE 0 END,
    total_moves = user_stats.total_moves + NEW.moves,
    best_time = CASE 
      WHEN NEW.won AND (user_stats.best_time IS NULL OR NEW.time_seconds < user_stats.best_time) 
      THEN NEW.time_seconds 
      ELSE user_stats.best_time 
    END,
    current_streak = CASE 
      WHEN NEW.won THEN user_stats.current_streak + 1 
      ELSE 0 
    END,
    longest_streak = CASE 
      WHEN NEW.won AND (user_stats.current_streak + 1) > user_stats.longest_streak 
      THEN user_stats.current_streak + 1 
      ELSE user_stats.longest_streak 
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when game session is added
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated;
GRANT SELECT, INSERT ON game_sessions TO authenticated;
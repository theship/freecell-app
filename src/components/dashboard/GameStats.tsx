'use client'

import { Trophy, Target, Clock, TrendingUp, RefreshCw } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface DisplayStats {
  gamesPlayed: number
  gamesWon: number
  winPercentage: number
  averageMoves: number
  bestTime: number | null
  currentStreak: number
  longestStreak: number
}

export function GameStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DisplayStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/stats', {
        cache: 'no-store' // Always fetch fresh data
      })
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const userStats = await response.json()
      setStats(userStats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [session?.user])

  // Add refresh button functionality
  const handleRefresh = () => {
    fetchStats()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Game Statistics</h2>
          <p className="text-gray-200">Loading your performance data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-gray-200 w-10 h-10"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Use real stats or defaults if none found
  const displayStats = stats || {
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    averageMoves: 0,
    bestTime: null,
    currentStreak: 0,
    longestStreak: 0
  }

  const statCards = [
    {
      title: "Games Played",
      value: displayStats.gamesPlayed,
      icon: Target,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Games Won",
      value: displayStats.gamesWon,
      icon: Trophy,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Win Rate",
      value: `${displayStats.winPercentage}%`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "Best Time",
      value: displayStats.bestTime 
        ? `${Math.floor(displayStats.bestTime / 60)}:${(displayStats.bestTime % 60).toString().padStart(2, '0')}`
        : "N/A",
      icon: Clock,
      color: "text-orange-600 bg-orange-100"
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Game Statistics</h2>
          <p className="text-gray-200">Track your Freecell performance over time</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Moves</span>
              <span className="font-semibold">{displayStats.averageMoves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Streak</span>
              <span className="font-semibold text-green-600">{displayStats.currentStreak} wins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold text-blue-600">{displayStats.longestStreak} wins</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {displayStats.gamesPlayed > 0 ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Games</span>
                  <span className="font-semibold">{displayStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">{displayStats.winPercentage}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold">{displayStats.currentStreak} wins</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No games played yet</p>
                <p className="text-sm">Start playing to see your stats!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
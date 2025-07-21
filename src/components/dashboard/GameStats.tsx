'use client'

import { Trophy, Target, Clock, TrendingUp } from "lucide-react"

export function GameStats() {

  const mockStats = {
    gamesPlayed: 42,
    gamesWon: 38,
    winPercentage: 90.5,
    averageMoves: 127,
    bestTime: 245,
    currentStreak: 5,
    longestStreak: 12
  }

  const statCards = [
    {
      title: "Games Played",
      value: mockStats.gamesPlayed,
      icon: Target,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Games Won",
      value: mockStats.gamesWon,
      icon: Trophy,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Win Rate",
      value: `${mockStats.winPercentage}%`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "Best Time",
      value: `${Math.floor(mockStats.bestTime / 60)}:${(mockStats.bestTime % 60).toString().padStart(2, '0')}`,
      icon: Clock,
      color: "text-orange-600 bg-orange-100"
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Statistics</h2>
        <p className="text-gray-600">Track your Freecell performance over time</p>
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
              <span className="font-semibold">{mockStats.averageMoves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Streak</span>
              <span className="font-semibold text-green-600">{mockStats.currentStreak} wins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Streak</span>
              <span className="font-semibold text-blue-600">{mockStats.longestStreak} wins</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Last Game</span>
              <span className="text-green-600 font-semibold">Won</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Moves</span>
              <span className="font-semibold">134</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Time</span>
              <span className="font-semibold">4:23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
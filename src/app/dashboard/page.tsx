'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { GameBoard } from "@/components/game/GameBoard"
import { UserProfile } from "@/components/dashboard/UserProfile"
import { GameStats } from "@/components/dashboard/GameStats"
import { useState } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'game' | 'stats'>('game')

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Freecell Game</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('game')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'game'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Play Game
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'stats'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Statistics
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'game' && <GameBoard />}
        {activeTab === 'stats' && <GameStats />}
      </main>
    </div>
  )
}
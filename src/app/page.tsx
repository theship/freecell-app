'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Club } from "lucide-react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <Club className="w-16 h-16 text-gray-800" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Freecell</h1>
        <p className="text-gray-600 mb-8">
          Play the classic solitaire card game. Test your skills and strategy!
        </p>

        {session ? (
          <Link
            href="/dashboard"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Continue to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Sign In to Play
          </Link>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Almost any deal can be won with enough skill!</p>
        </div>
      </div>
    </div>
  )
}
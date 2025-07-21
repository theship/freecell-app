'use client'

import { useSession, signOut } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import { useState } from "react"

export function UserProfile() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <User className="w-5 h-5" />
        <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <div className="font-medium">{session.user.name}</div>
            <div className="text-gray-500">{session.user.email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
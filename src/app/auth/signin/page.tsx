'use client'

import { signIn, getProviders } from "next-auth/react"
import { useEffect, useState } from "react"
import { Github, Mail } from "lucide-react"

interface Provider {
  id: string
  name: string
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders()
      setProviders(response)
    }
    setUpProviders()
  }, [])

  if (!providers) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to Freecell
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Play the classic card game with your account
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {Object.values(providers).map((provider: Provider) => {
            const isGithub = provider.id === 'github'
            const isGoogle = provider.id === 'google'
            
            return (
              <button
                key={provider.name}
                onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isGithub 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-gray-900'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600'
                }`}
              >
                {isGithub && <Github className="mr-2 h-4 w-4" />}
                {isGoogle && <Mail className="mr-2 h-4 w-4" />}
                Sign in with {provider.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
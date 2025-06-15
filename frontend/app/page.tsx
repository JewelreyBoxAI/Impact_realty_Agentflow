'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard on load
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0C0F1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="font-orbitron text-2xl font-bold gradient-text mb-2">
          IMPACT REALTY AI
        </h1>
        <p className="text-gray-400">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  )
} 
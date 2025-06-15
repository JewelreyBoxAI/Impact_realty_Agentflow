'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4" />
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
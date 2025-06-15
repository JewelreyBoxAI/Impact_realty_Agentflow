'use client'

import React from 'react'

interface LogViewerProps {
  logs: any[]
  loading: boolean
}

export function LogViewer({ logs, loading }: LogViewerProps) {
  return (
    <div className="card-bg rounded-2xl p-6">
      <h2 className="font-orbitron text-xl font-semibold text-white mb-4">
        SYSTEM LOGS
      </h2>
      {loading ? (
        <p className="text-gray-400">Loading logs...</p>
      ) : (
        <p className="text-gray-400">Log viewer component will be implemented here.</p>
      )}
    </div>
  )
} 
'use client'

import React from 'react'
import { Bell, User, Zap, Activity } from 'lucide-react'

export function TopNav() {
  return (
    <header className="h-16 bg-background-primary border-b border-primary-500/20 px-6 flex items-center justify-between">
      {/* Left side - Current page indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          <span className="font-orbitron text-lg font-semibold text-white">
            SUPERVISOR CONTROL
          </span>
        </div>
        <div className="h-6 w-px bg-primary-500/30" />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="status-indicator status-active" />
          <span>4 Agents Active</span>
        </div>
      </div>

      {/* Right side - Controls and user */}
      <div className="flex items-center gap-4">
        {/* System metrics */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">CPU: 23%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
            <span className="text-gray-300">Memory: 1.2GB</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-primary-500/10 transition-colors">
          <Bell className="w-5 h-5 text-gray-300 hover:text-primary-500" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-primary-500/20">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">Kevin Montes</p>
            <p className="text-xs text-gray-400">System Administrator</p>
          </div>
          <button className="p-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-colors">
            <User className="w-5 h-5 text-primary-500" />
          </button>
        </div>
      </div>
    </header>
  )
} 
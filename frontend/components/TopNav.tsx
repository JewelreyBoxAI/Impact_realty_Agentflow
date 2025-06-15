'use client'

import React from 'react'
import { Bell, User, Zap, Activity } from 'lucide-react'

export function TopNav() {
  return (
    <header className="h-16 bg-[#0C0F1A] border-b border-[#00FFFF]/20 px-6 flex items-center justify-between">
      {/* Left side - Current page indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00FFFF]" />
          <span className="font-orbitron text-lg font-semibold text-white">
            SUPERVISOR CONTROL
          </span>
        </div>
        <div className="h-6 w-px bg-[#00FFFF]/30" />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>4 Agents Active</span>
        </div>
      </div>

      {/* Right side - Controls and user */}
      <div className="flex items-center gap-4">
        {/* System metrics */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFA500]" />
            <span className="text-gray-300">CPU: 23%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00FFFF] rounded-full" />
            <span className="text-gray-300">Memory: 1.2GB</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#00FFFF]/10 transition-colors">
          <Bell className="w-5 h-5 text-gray-300 hover:text-[#00FFFF]" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFA500] rounded-full animate-pulse" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#00FFFF]/20">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">Kevin Montes</p>
            <p className="text-xs text-gray-400">System Administrator</p>
          </div>
          <button className="p-2 rounded-lg bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 transition-colors">
            <User className="w-5 h-5 text-[#00FFFF]" />
          </button>
        </div>
      </div>
    </header>
  )
} 
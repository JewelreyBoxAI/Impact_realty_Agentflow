'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  List, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Compliance', icon: ShieldCheck, path: '/compliance' },
  { label: 'Recruiting', icon: Users, path: '/recruiting' },
  { label: 'Investments', icon: Briefcase, path: '/investments' },
  { label: 'Logs', icon: List, path: '/logs' },
  { label: 'Admin', icon: Settings, path: '/admin' },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-background-primary border-r border-primary-500/20 
      transition-all duration-300 ease-in-out
      flex flex-col h-full
      relative
    `}>
      {/* Header */}
      <div className="p-6 border-b border-primary-500/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="font-orbitron text-xl font-bold gradient-text">
                IMPACT REALTY
              </h1>
              <p className="text-secondary-500 text-xs font-medium tracking-wider">
                AGENT PLATFORM
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-primary-500/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-primary-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                nav-item
                ${isActive ? 'active' : ''}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-medium tracking-wide">
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto status-indicator status-active" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status Indicator */}
      <div className="p-4 border-t border-primary-500/20">
        <div className={`
          flex items-center gap-3 p-3 rounded-lg bg-primary-500/5
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          <div className="status-indicator status-active" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-green-400">
                SYSTEM ONLINE
              </span>
              <span className="text-xs text-gray-400">
                All agents operational
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
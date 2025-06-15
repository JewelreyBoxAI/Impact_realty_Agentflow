'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPIWidgetProps {
  title: string
  value: number
  trend: 'up' | 'down' | 'stable'
  color: 'red' | 'blue' | 'green' | 'purple' | 'yellow'
  onClick?: () => void
}

export function KPIWidget({ title, value, trend, color, onClick }: KPIWidgetProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          accent: 'text-red-300'
        }
      case 'blue':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          accent: 'text-blue-300'
        }
      case 'green':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          accent: 'text-green-300'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          accent: 'text-purple-300'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          accent: 'text-yellow-300'
        }
      default:
        return {
          bg: 'bg-[#00FFFF]/10',
          border: 'border-[#00FFFF]/30',
          text: 'text-[#00FFFF]',
          accent: 'text-[#00CED1]'
        }
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case 'stable':
        return <Minus className="w-4 h-4 text-yellow-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return 'TRENDING UP'
      case 'down':
        return 'TRENDING DOWN'
      case 'stable':
        return 'STABLE'
      default:
        return 'NO DATA'
    }
  }

  const colors = getColorClasses()

  return (
    <div 
      className={`
        ${colors.bg} ${colors.border} border rounded-2xl p-6 
        transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${onClick ? 'cursor-pointer hover:border-opacity-60' : ''}
        backdrop-filter backdrop-blur-sm
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron text-sm font-medium text-gray-300 tracking-wider">
          {title.toUpperCase()}
        </h3>
        {getTrendIcon()}
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className={`text-4xl font-orbitron font-bold ${colors.text} mb-1`}>
          {value.toLocaleString()}
        </div>
        <div className={`text-xs ${colors.accent} font-medium tracking-wide`}>
          {getTrendText()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className={`
              h-2 rounded-full transition-all duration-1000 ease-out
              ${color === 'red' ? 'bg-red-400' : ''}
              ${color === 'blue' ? 'bg-blue-400' : ''}
              ${color === 'green' ? 'bg-green-400' : ''}
              ${color === 'purple' ? 'bg-purple-400' : ''}
              ${color === 'yellow' ? 'bg-yellow-400' : ''}
            `}
            style={{ 
              width: `${Math.min((value / 100) * 100, 100)}%`,
              boxShadow: `0 0 10px ${colors.text.replace('text-', 'rgba(').replace('400', '400, 0.5)')}`
            }}
          />
        </div>
      </div>

      {/* Action Hint */}
      {onClick && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Click to view details</span>
          <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} animate-pulse`} />
        </div>
      )}

      {/* Glow Effect */}
      <div 
        className={`
          absolute inset-0 rounded-2xl opacity-0 hover:opacity-20 transition-opacity duration-300
          ${color === 'red' ? 'bg-red-400' : ''}
          ${color === 'blue' ? 'bg-blue-400' : ''}
          ${color === 'green' ? 'bg-green-400' : ''}
          ${color === 'purple' ? 'bg-purple-400' : ''}
          ${color === 'yellow' ? 'bg-yellow-400' : ''}
          pointer-events-none
        `}
        style={{
          filter: 'blur(20px)',
          zIndex: -1
        }}
      />
    </div>
  )
} 
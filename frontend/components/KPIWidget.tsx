'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPIWidgetProps {
  title: string
  value: number | string
  trend?: 'up' | 'down' | 'stable' | 'none'
  format?: 'number' | 'currency' | 'percentage'
  subtitle?: string
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export function KPIWidget({ 
  title, 
  value, 
  trend = 'none', 
  format = 'number',
  subtitle,
  icon,
  color = 'primary'
}: KPIWidgetProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      case 'percentage':
        return `${val}%`
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val)
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

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-green-400 border-green-400/20'
      case 'warning':
        return 'text-yellow-400 border-yellow-400/20'
      case 'error':
        return 'text-red-400 border-red-400/20'
      case 'primary':
      default:
        return 'text-primary-500 border-primary-500/20'
    }
  }

  return (
    <div className={`metric-card ${getColorClasses()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-3xl font-orbitron font-bold ${getColorClasses().split(' ')[0]} mb-1`}>
            {formatValue(value)}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        {trend !== 'none' && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
          </div>
        )}
      </div>

      {/* Progress bar for percentage values */}
      {format === 'percentage' && typeof value === 'number' && (
        <div className="mt-4">
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                color === 'success' ? 'bg-green-400' :
                color === 'warning' ? 'bg-yellow-400' :
                color === 'error' ? 'bg-red-400' :
                'bg-primary-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 
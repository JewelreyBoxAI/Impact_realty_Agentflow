'use client'

import React from 'react'
import { Play, Pause, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface AgentStatus {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'error'
  lastActivity: string
  tasksCompleted: number
  successRate: number
}

interface AgentStatusCardProps {
  agent: AgentStatus
  onExecute: (action: string) => void
}

export function AgentStatusCard({ agent, onExecute }: AgentStatusCardProps) {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'active':
        return <Play className="w-5 h-5 text-green-400" />
      case 'idle':
        return <Pause className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (agent.status) {
      case 'active':
        return 'border-green-400/50 bg-green-400/5'
      case 'idle':
        return 'border-yellow-400/50 bg-yellow-400/5'
      case 'error':
        return 'border-red-400/50 bg-red-400/5'
      default:
        return 'border-gray-400/50 bg-gray-400/5'
    }
  }

  const getStatusText = () => {
    switch (agent.status) {
      case 'active':
        return 'ACTIVE'
      case 'idle':
        return 'IDLE'
      case 'error':
        return 'ERROR'
      default:
        return 'UNKNOWN'
    }
  }

  return (
    <div className={`agent-card p-6 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-orbitron font-semibold text-white text-lg">
              {agent.name.toUpperCase()}
            </h3>
            <p className="text-sm text-gray-400">{agent.type}</p>
          </div>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${agent.status === 'active' ? 'bg-green-400/20 text-green-400' : ''}
          ${agent.status === 'idle' ? 'bg-yellow-400/20 text-yellow-400' : ''}
          ${agent.status === 'error' ? 'bg-red-400/20 text-red-400' : ''}
        `}>
          {getStatusText()}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-orbitron font-bold text-[#00FFFF]">
            {agent.tasksCompleted}
          </div>
          <div className="text-xs text-gray-400">Tasks Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-orbitron font-bold text-[#00CED1]">
            {agent.successRate}%
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Last Activity */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last Activity: {agent.lastActivity}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onExecute('start')}
          disabled={agent.status === 'active'}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
            ${agent.status === 'active' 
              ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed' 
              : 'neon-button'
            }
          `}
        >
          {agent.status === 'active' ? 'RUNNING' : 'START'}
        </button>
        <button
          onClick={() => onExecute('stop')}
          disabled={agent.status !== 'active'}
          className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
            ${agent.status !== 'active' 
              ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed' 
              : 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30'
            }
          `}
        >
          STOP
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-[#00FFFF]/10">
        <div className="flex gap-2">
          <button
            onClick={() => onExecute('status')}
            className="text-xs text-[#00FFFF] hover:text-[#00CED1] transition-colors"
          >
            STATUS
          </button>
          <span className="text-xs text-gray-600">•</span>
          <button
            onClick={() => onExecute('logs')}
            className="text-xs text-[#00FFFF] hover:text-[#00CED1] transition-colors"
          >
            LOGS
          </button>
          <span className="text-xs text-gray-600">•</span>
          <button
            onClick={() => onExecute('config')}
            className="text-xs text-[#00FFFF] hover:text-[#00CED1] transition-colors"
          >
            CONFIG
          </button>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>Performance</span>
          <span>{agent.successRate}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`
              h-2 rounded-full transition-all duration-500
              ${agent.successRate >= 90 ? 'bg-green-400' : ''}
              ${agent.successRate >= 70 && agent.successRate < 90 ? 'bg-yellow-400' : ''}
              ${agent.successRate < 70 ? 'bg-red-400' : ''}
            `}
            style={{ width: `${agent.successRate}%` }}
          />
        </div>
      </div>
    </div>
  )
} 
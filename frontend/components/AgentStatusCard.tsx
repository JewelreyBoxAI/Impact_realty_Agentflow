'use client'

import React from 'react'
import { Play, Pause, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { AgentStatus } from '@/types/agents'

interface AgentStatusCardProps {
  agentId: string
  status?: AgentStatus
  showDetails?: boolean
  onAction?: (action: string) => void
}

export function AgentStatusCard({ 
  agentId, 
  status, 
  showDetails = false, 
  onAction 
}: AgentStatusCardProps) {
  const getStatusIcon = (agentStatus: string) => {
    switch (agentStatus) {
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

  const getStatusColor = (agentStatus: string) => {
    switch (agentStatus) {
      case 'active':
        return 'text-green-400'
      case 'idle':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const mockStatus: AgentStatus = {
    agentId,
    status: 'active',
    health: 'healthy',
    uptime: '99.8%',
    lastExecution: '2 minutes ago',
    queueSize: 3,
    performance: {
      tasksCompleted: 1247,
      successRate: 98.5,
      averageResponseTime: 1200,
      errorCount: 3
    },
    resources: {
      cpuUsage: 23,
      memoryUsage: 45,
      diskUsage: 12
    }
  }

  const agentStatus = status || mockStatus

  return (
    <div className="agent-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(agentStatus.status)}
          <div>
            <h3 className="font-orbitron text-lg font-semibold text-white capitalize">
              {agentId}
            </h3>
            <p className={`text-sm ${getStatusColor(agentStatus.status)}`}>
              {agentStatus.status.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`status-indicator ${
            agentStatus.health === 'healthy' ? 'status-active' :
            agentStatus.health === 'warning' ? 'status-warning' : 'status-error'
          }`} />
          <span className={`text-xs font-medium ${getHealthColor(agentStatus.health)}`}>
            {agentStatus.health.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-orbitron font-bold text-primary-500">
            {agentStatus.performance.tasksCompleted}
          </div>
          <div className="text-xs text-gray-400">Tasks Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-orbitron font-bold text-green-400">
            {agentStatus.performance.successRate}%
          </div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Queue and Last Activity */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Queue Size:</span>
          <span className="text-white">{agentStatus.queueSize}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Last Activity:</span>
          <span className="text-white">{agentStatus.lastExecution}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Uptime:</span>
          <span className="text-green-400">{agentStatus.uptime}</span>
        </div>
      </div>

      {/* Resource Usage */}
      {showDetails && (
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">CPU Usage</span>
              <span className="text-white">{agentStatus.resources.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${agentStatus.resources.cpuUsage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Memory</span>
              <span className="text-white">{agentStatus.resources.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${agentStatus.resources.memoryUsage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => onAction?.('restart')}
          className="flex-1 neon-button py-2 px-3 rounded text-sm font-medium"
        >
          RESTART
        </button>
        <button 
          onClick={() => onAction?.('details')}
          className="flex-1 bg-gray-600/20 border border-gray-600 text-gray-300 py-2 px-3 rounded text-sm font-medium hover:bg-gray-600/30 transition-colors"
        >
          DETAILS
        </button>
      </div>
    </div>
  )
} 
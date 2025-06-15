'use client'

import React, { useState, useEffect } from 'react'
import { AdminConfigPanel } from '@/components/AdminConfigPanel'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  agents: 'healthy' | 'warning' | 'error'
  mcp: 'healthy' | 'warning' | 'error'
  integrations: 'healthy' | 'warning' | 'error'
}

export default function AdminPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    agents: 'healthy',
    mcp: 'healthy',
    integrations: 'healthy'
  })
  const [loading, setLoading] = useState(true)
  const [agentStatuses, setAgentStatuses] = useState<any[]>([])

  useEffect(() => {
    loadSystemStatus()
    const interval = setInterval(loadSystemStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemStatus = async () => {
    try {
      // Check agent statuses
      const agents = await supabaseClient.getAgentStatuses()
      setAgentStatuses(agents)

      // Check MCP health
      const healthCheck = await mcpRouter.healthCheck()
      
      // Determine system health
      const agentHealth = agents.every(agent => agent.status === 'active') ? 'healthy' : 'warning'
      const mcpHealth = Object.values(healthCheck).every(result => result.success) ? 'healthy' : 'warning'

      setSystemHealth({
        database: 'healthy', // Assume healthy if we got data
        agents: agentHealth,
        mcp: mcpHealth,
        integrations: 'healthy' // Mock for now
      })
    } catch (error) {
      console.error('Failed to load system status:', error)
      setSystemHealth({
        database: 'error',
        agents: 'error',
        mcp: 'error',
        integrations: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const restartAgent = async (agentId: string) => {
    try {
      const result = await mcpRouter.invokeAgent('supervisor', {
        action: 'restart_agent',
        agent_id: agentId
      })
      if (result.success) {
        console.log('Agent restarted:', result.data)
        loadSystemStatus() // Refresh
      }
    } catch (error) {
      console.error('Failed to restart agent:', error)
    }
  }

  const runSystemDiagnostics = async () => {
    try {
      const result = await mcpRouter.invokeAgent('supervisor', {
        action: 'system_diagnostics',
        full_scan: true
      })
      if (result.success) {
        console.log('System diagnostics completed:', result.data)
        loadSystemStatus()
      }
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
    }
  }

  const emergencyShutdown = async () => {
    if (confirm('Are you sure you want to perform an emergency shutdown? This will stop all agents.')) {
      try {
        const result = await mcpRouter.invokeAgent('supervisor', {
          action: 'emergency_shutdown',
          reason: 'admin_initiated'
        })
        if (result.success) {
          console.log('Emergency shutdown initiated:', result.data)
          loadSystemStatus()
        }
      } catch (error) {
        console.error('Failed to initiate emergency shutdown:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#00FFFF] font-orbitron">Loading System Status...</p>
        </div>
      </div>
    )
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '●'
      case 'warning': return '▲'
      case 'error': return '✕'
      default: return '○'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold gradient-text">
            ADMIN CONTROL
          </h1>
          <p className="text-gray-400 mt-2">
            System configuration and agent management
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runSystemDiagnostics}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            SYSTEM DIAGNOSTICS
          </button>
          <button 
            onClick={emergencyShutdown}
            className="bg-red-500/20 border border-red-500 text-red-400 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
          >
            EMERGENCY STOP
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className={`text-3xl font-orbitron font-bold mb-2 ${getHealthColor(systemHealth.database)}`}>
              {getHealthIcon(systemHealth.database)}
            </div>
            <div className="text-sm text-gray-400">Database</div>
            <div className={`text-xs mt-1 ${getHealthColor(systemHealth.database)}`}>
              {systemHealth.database.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className={`text-3xl font-orbitron font-bold mb-2 ${getHealthColor(systemHealth.agents)}`}>
              {getHealthIcon(systemHealth.agents)}
            </div>
            <div className="text-sm text-gray-400">Agents</div>
            <div className={`text-xs mt-1 ${getHealthColor(systemHealth.agents)}`}>
              {systemHealth.agents.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className={`text-3xl font-orbitron font-bold mb-2 ${getHealthColor(systemHealth.mcp)}`}>
              {getHealthIcon(systemHealth.mcp)}
            </div>
            <div className="text-sm text-gray-400">MCP Gateway</div>
            <div className={`text-xs mt-1 ${getHealthColor(systemHealth.mcp)}`}>
              {systemHealth.mcp.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className={`text-3xl font-orbitron font-bold mb-2 ${getHealthColor(systemHealth.integrations)}`}>
              {getHealthIcon(systemHealth.integrations)}
            </div>
            <div className="text-sm text-gray-400">Integrations</div>
            <div className={`text-xs mt-1 ${getHealthColor(systemHealth.integrations)}`}>
              {systemHealth.integrations.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Management */}
      <div className="card-bg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron text-lg font-semibold text-white">
            AGENT MANAGEMENT
          </h3>
          <button 
            onClick={loadSystemStatus}
            className="text-[#00FFFF] hover:text-[#00CED1] text-sm font-medium"
          >
            REFRESH STATUS
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentStatuses.map((agent) => (
            <div key={agent.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-medium text-white">{agent.name}</span>
                </div>
                <span className="text-xs text-gray-400">{agent.type}</span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div>Status: <span className={getHealthColor(agent.status === 'active' ? 'healthy' : 'warning')}>{agent.status}</span></div>
                <div>Tasks: {agent.tasksCompleted}</div>
                <div>Success Rate: {agent.successRate}%</div>
                <div>Last Activity: {agent.lastActivity}</div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => restartAgent(agent.id)}
                  className="flex-1 text-xs py-2 px-3 rounded bg-[#00FFFF]/20 text-[#00FFFF] hover:bg-[#00FFFF]/30 transition-colors"
                >
                  RESTART
                </button>
                <button 
                  onClick={() => mcpRouter.getAgentStatus(agent.name.toLowerCase())}
                  className="flex-1 text-xs py-2 px-3 rounded bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-colors"
                >
                  DETAILS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Configuration Panel */}
      <AdminConfigPanel />

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={runSystemDiagnostics}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Full Diagnostics</div>
          </button>
          <button 
            onClick={() => loadSystemStatus()}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Refresh Status</div>
          </button>
          <button 
            onClick={() => mcpRouter.invokeAgent('supervisor', { action: 'backup_system' })}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Backup System</div>
          </button>
          <button 
            onClick={() => mcpRouter.invokeAgent('supervisor', { action: 'clear_cache' })}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Clear Cache</div>
          </button>
        </div>
      </div>
    </div>
  )
} 
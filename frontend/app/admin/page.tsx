'use client'

import React, { useState, useEffect } from 'react'
import { AdminConfigPanel } from '@/components/AdminConfigPanel'
import { KPIWidget } from '@/components/KPIWidget'
import { mcpRouter } from '@/utils/mcpRouter'
import { Settings, Server, Database, Shield, Users, Activity } from 'lucide-react'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [systemStats, setSystemStats] = useState({
    uptime: '99.8%',
    totalUsers: 12,
    activeConnections: 8,
    systemLoad: 23
  })

  useEffect(() => {
    loadSystemStats()
    const interval = setInterval(loadSystemStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSystemStats = async () => {
    try {
      // In a real implementation, this would fetch actual system metrics
      setSystemStats({
        uptime: '99.8%',
        totalUsers: 12,
        activeConnections: 8,
        systemLoad: Math.floor(Math.random() * 50) + 10
      })
    } catch (error) {
      console.error('Failed to load system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async (config: any) => {
    try {
      const result = await mcpRouter.executeWorkflow('update_system_config', {
        config,
        priority: 'high'
      })
      
      if (result.success) {
        console.log('Configuration saved:', result.data)
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }

  const handleResetConfig = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('reset_system_config', {
        priority: 'high'
      })
      
      if (result.success) {
        console.log('Configuration reset:', result.data)
      }
    } catch (error) {
      console.error('Failed to reset configuration:', error)
    }
  }

  const restartSystem = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('system_restart', {
        priority: 'critical'
      })
      
      if (result.success) {
        console.log('System restart initiated:', result.data)
      }
    } catch (error) {
      console.error('Failed to restart system:', error)
    }
  }

  const backupSystem = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('system_backup', {
        type: 'full',
        priority: 'high'
      })
      
      if (result.success) {
        console.log('System backup initiated:', result.data)
      }
    } catch (error) {
      console.error('Failed to backup system:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-primary-500 font-orbitron">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">
            SYSTEM ADMINISTRATION
          </h1>
          <p className="section-subtitle">
            System configuration and management tools
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={backupSystem}
            className="bg-blue-500/20 border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
          >
            BACKUP SYSTEM
          </button>
          <button 
            onClick={restartSystem}
            className="bg-red-500/20 border border-red-500 text-red-400 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
          >
            RESTART SYSTEM
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="stats-grid">
        <KPIWidget
          title="System Uptime"
          value={systemStats.uptime}
          icon={<Server className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Total Users"
          value={systemStats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="primary"
        />
        <KPIWidget
          title="Active Connections"
          value={systemStats.activeConnections}
          icon={<Activity className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="System Load"
          value={systemStats.systemLoad}
          format="percentage"
          trend={systemStats.systemLoad > 70 ? 'up' : 'stable'}
          icon={<Database className="w-5 h-5" />}
          color={systemStats.systemLoad > 70 ? 'warning' : 'success'}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-500" />
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-bg rounded-2xl p-6 text-center">
            <Server className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-orbitron font-semibold text-white mb-2">System Status</h3>
            <p className="text-sm text-gray-400 mb-4">Monitor system health and performance</p>
            <button className="w-full bg-blue-500/20 border border-blue-500 text-blue-400 py-2 px-4 rounded-lg font-medium hover:bg-blue-500/30 transition-colors">
              VIEW STATUS
            </button>
          </div>

          <div className="card-bg rounded-2xl p-6 text-center">
            <Database className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-orbitron font-semibold text-white mb-2">Database</h3>
            <p className="text-sm text-gray-400 mb-4">Manage database connections and queries</p>
            <button className="w-full bg-green-500/20 border border-green-500 text-green-400 py-2 px-4 rounded-lg font-medium hover:bg-green-500/30 transition-colors">
              MANAGE DB
            </button>
          </div>

          <div className="card-bg rounded-2xl p-6 text-center">
            <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-orbitron font-semibold text-white mb-2">Security</h3>
            <p className="text-sm text-gray-400 mb-4">Configure security settings and policies</p>
            <button className="w-full bg-yellow-500/20 border border-yellow-500 text-yellow-400 py-2 px-4 rounded-lg font-medium hover:bg-yellow-500/30 transition-colors">
              SECURITY
            </button>
          </div>

          <div className="card-bg rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-orbitron font-semibold text-white mb-2">User Management</h3>
            <p className="text-sm text-gray-400 mb-4">Manage user accounts and permissions</p>
            <button className="w-full bg-purple-500/20 border border-purple-500 text-purple-400 py-2 px-4 rounded-lg font-medium hover:bg-purple-500/30 transition-colors">
              MANAGE USERS
            </button>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-500" />
          SYSTEM CONFIGURATION
        </h2>
        <AdminConfigPanel 
          onSaveConfig={handleSaveConfig}
          onResetConfig={handleResetConfig}
        />
      </div>

      {/* System Information */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Server className="w-5 h-5 text-primary-500" />
          SYSTEM INFORMATION
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-bg rounded-2xl p-6">
            <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
              ENVIRONMENT
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Environment:</span>
                <span className="text-green-400">Production</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-white">v2.1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Build:</span>
                <span className="text-white">#1247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Deploy:</span>
                <span className="text-white">2024-01-15 14:30 UTC</span>
              </div>
            </div>
          </div>

          <div className="card-bg rounded-2xl p-6">
            <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
              RESOURCES
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-white">{systemStats.systemLoad}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemStats.systemLoad}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all duration-300 w-[45%]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Disk Usage</span>
                  <span className="text-white">67%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full transition-all duration-300 w-[67%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
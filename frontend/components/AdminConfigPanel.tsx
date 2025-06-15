'use client'

import React, { useState } from 'react'
import { Settings, Users, Shield, Database, Bell, Save, RotateCcw } from 'lucide-react'

interface AdminConfigPanelProps {
  onSaveConfig?: (config: any) => void
  onResetConfig?: () => void
}

interface SystemConfig {
  agents: {
    maxConcurrentTasks: number
    autoRestart: boolean
    logLevel: string
    healthCheckInterval: number
  }
  database: {
    connectionPoolSize: number
    queryTimeout: number
    backupInterval: number
    retentionDays: number
  }
  notifications: {
    emailEnabled: boolean
    slackEnabled: boolean
    criticalAlertsOnly: boolean
    notificationChannels: string[]
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireMFA: boolean
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
    }
  }
}

export function AdminConfigPanel({ onSaveConfig, onResetConfig }: AdminConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('agents')
  const [hasChanges, setHasChanges] = useState(false)
  const [config, setConfig] = useState<SystemConfig>({
    agents: {
      maxConcurrentTasks: 10,
      autoRestart: true,
      logLevel: 'info',
      healthCheckInterval: 30
    },
    database: {
      connectionPoolSize: 20,
      queryTimeout: 30,
      backupInterval: 24,
      retentionDays: 90
    },
    notifications: {
      emailEnabled: true,
      slackEnabled: false,
      criticalAlertsOnly: false,
      notificationChannels: ['email', 'dashboard']
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireMFA: false,
      passwordPolicy: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true
      }
    }
  })

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const updateNestedConfig = (section: keyof SystemConfig, nestedField: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...(prev[section] as any)[nestedField],
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSaveConfig?.(config)
    setHasChanges(false)
  }

  const handleReset = () => {
    onResetConfig?.()
    setHasChanges(false)
  }

  const tabs = [
    { id: 'agents', label: 'Agent Settings', icon: Users },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const renderAgentSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Concurrent Tasks per Agent
        </label>
        <input
          type="number"
          value={config.agents.maxConcurrentTasks}
          onChange={(e) => updateConfig('agents', 'maxConcurrentTasks', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="1"
          max="50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.agents.autoRestart}
            onChange={(e) => updateConfig('agents', 'autoRestart', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-300">Auto-restart agents on failure</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Log Level
        </label>
        <select
          value={config.agents.logLevel}
          onChange={(e) => updateConfig('agents', 'logLevel', e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
        >
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Health Check Interval (seconds)
        </label>
        <input
          type="number"
          value={config.agents.healthCheckInterval}
          onChange={(e) => updateConfig('agents', 'healthCheckInterval', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="10"
          max="300"
        />
      </div>
    </div>
  )

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Connection Pool Size
        </label>
        <input
          type="number"
          value={config.database.connectionPoolSize}
          onChange={(e) => updateConfig('database', 'connectionPoolSize', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="5"
          max="100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Query Timeout (seconds)
        </label>
        <input
          type="number"
          value={config.database.queryTimeout}
          onChange={(e) => updateConfig('database', 'queryTimeout', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="5"
          max="300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Backup Interval (hours)
        </label>
        <input
          type="number"
          value={config.database.backupInterval}
          onChange={(e) => updateConfig('database', 'backupInterval', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="1"
          max="168"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Log Retention (days)
        </label>
        <input
          type="number"
          value={config.database.retentionDays}
          onChange={(e) => updateConfig('database', 'retentionDays', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="7"
          max="365"
        />
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notifications.emailEnabled}
            onChange={(e) => updateConfig('notifications', 'emailEnabled', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-300">Enable email notifications</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notifications.slackEnabled}
            onChange={(e) => updateConfig('notifications', 'slackEnabled', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-300">Enable Slack notifications</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notifications.criticalAlertsOnly}
            onChange={(e) => updateConfig('notifications', 'criticalAlertsOnly', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-300">Critical alerts only</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notification Channels
        </label>
        <div className="space-y-2">
          {['email', 'slack', 'dashboard', 'sms'].map(channel => (
            <label key={channel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notifications.notificationChannels.includes(channel)}
                onChange={(e) => {
                  const channels = e.target.checked
                    ? [...config.notifications.notificationChannels, channel]
                    : config.notifications.notificationChannels.filter(c => c !== channel)
                  updateConfig('notifications', 'notificationChannels', channels)
                }}
                className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-300 capitalize">{channel}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={config.security.sessionTimeout}
          onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="5"
          max="480"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          value={config.security.maxLoginAttempts}
          onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
          min="3"
          max="10"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.security.requireMFA}
            onChange={(e) => updateConfig('security', 'requireMFA', e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-300">Require Multi-Factor Authentication</span>
        </label>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Password Policy</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Minimum Length
          </label>
          <input
            type="number"
            value={config.security.passwordPolicy.minLength}
            onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-full"
            min="6"
            max="32"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.security.passwordPolicy.requireSpecialChars}
              onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Require special characters</span>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.security.passwordPolicy.requireNumbers}
              onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Require numbers</span>
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="card-bg rounded-2xl p-6">
        {activeTab === 'agents' && renderAgentSettings()}
        {activeTab === 'database' && renderDatabaseSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {hasChanges && (
            <span className="text-sm text-yellow-400">
              You have unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-600/20 border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-600/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            RESET
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasChanges
                ? 'neon-button'
                : 'bg-gray-600/20 border border-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  )
} 
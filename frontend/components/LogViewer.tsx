'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Info, AlertCircle, Bug, Search, Filter } from 'lucide-react'
import { SystemLog } from '@/types/database'

interface LogViewerProps {
  logs: SystemLog[]
  onRefresh?: () => void
  autoRefresh?: boolean
}

export function LogViewer({ logs, onRefresh, autoRefresh = false }: LogViewerProps) {
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>(logs)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(onRefresh, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, onRefresh])

  useEffect(() => {
    let filtered = logs

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter)
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }, [logs, levelFilter, sourceFilter, searchTerm])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />
      case 'debug':
        return <Bug className="w-4 h-4 text-gray-400" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'warn':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'info':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'debug':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getSourceColor = (source: string) => {
    const colors = [
      'text-purple-400',
      'text-green-400',
      'text-orange-400',
      'text-pink-400',
      'text-cyan-400'
    ]
    const hash = source.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const uniqueSources = Array.from(new Set(logs.map(log => log.source)))

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary-500 w-64"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {filteredLogs.length} of {logs.length} logs
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-primary-500/20 border border-primary-500 text-primary-400 px-4 py-2 rounded-lg font-medium hover:bg-primary-500/30 transition-colors"
            >
              REFRESH
            </button>
          )}
        </div>
      </div>

      {/* Log List */}
      <div className="card-bg rounded-2xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No logs found</div>
              <div className="text-sm text-gray-500">
                {searchTerm || levelFilter !== 'all' || sourceFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Logs will appear here as system events occur'
                }
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Level Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getLevelIcon(log.level)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className={`text-sm font-medium ${getSourceColor(log.source)}`}>
                          {log.source}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {log.message}
                      </p>

                      {/* Metadata */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                          <div className="text-gray-400 mb-1">Metadata:</div>
                          <pre className="text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* User/Session Info */}
                      {(log.userId || log.sessionId) && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                          {log.userId && <span>User: {log.userId}</span>}
                          {log.sessionId && <span>Session: {log.sessionId.slice(0, 8)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="flex items-center justify-center text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
          Auto-refreshing every 5 seconds
        </div>
      )}
    </div>
  )
} 
'use client'

import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Eye, Download } from 'lucide-react'
import { ComplianceRecord } from '@/types/database'

interface ComplianceTableProps {
  records: ComplianceRecord[]
  onViewRecord?: (record: ComplianceRecord) => void
  onDownloadReport?: (recordId: string) => void
}

export function ComplianceTable({ records, onViewRecord, onDownloadReport }: ComplianceTableProps) {
  const [sortField, setSortField] = useState<keyof ComplianceRecord>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'violation':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-400 bg-green-400/10'
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'violation':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400'
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const handleSort = (field: keyof ComplianceRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredRecords = records.filter(record => 
    filterStatus === 'all' || record.status === filterStatus
  )

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="compliant">Compliant</option>
            <option value="warning">Warning</option>
            <option value="violation">Violation</option>
          </select>
        </div>
        <div className="text-sm text-gray-400">
          {sortedRecords.length} records
        </div>
      </div>

      {/* Table */}
      <div className="card-bg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                  onClick={() => handleSort('createdAt')}
                >
                  Date
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                  onClick={() => handleSort('type')}
                >
                  Type
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                    {record.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getPriorityColor(record.priority)}`}>
                      {record.priority?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                    {record.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewRecord?.(record)}
                        className="text-primary-500 hover:text-primary-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownloadReport?.(record.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No compliance records found</div>
            <div className="text-sm text-gray-500">
              {filterStatus !== 'all' ? 'Try adjusting your filters' : 'Records will appear here once audits are completed'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
'use client'

import React from 'react'
import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react'

interface ComplianceItem {
  id: string
  dealId: string
  type: string
  status: 'pending' | 'review' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  dueDate: string
  assignedTo: string
  documents: string[]
  lastUpdated: string
}

interface ComplianceTableProps {
  items: ComplianceItem[]
  selectedItems: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onItemAction: (itemId: string, action: string) => void
}

export function ComplianceTable({ 
  items, 
  selectedItems, 
  onSelectionChange, 
  onItemAction 
}: ComplianceTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-400/10'
      case 'high':
        return 'text-orange-400 bg-orange-400/10'
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'low':
        return 'text-green-400 bg-green-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map(item => item.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#00FFFF]/20">
            <th className="text-left p-4">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length && items.length > 0}
                onChange={handleSelectAll}
                className="rounded border-[#00FFFF]/30 bg-transparent text-[#00FFFF] focus:ring-[#00FFFF]/50"
              />
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              STATUS
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              PRIORITY
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              DESCRIPTION
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              DUE DATE
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              DOCUMENTS
            </th>
            <th className="text-left p-4 font-orbitron text-sm font-semibold text-[#00FFFF]">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr 
              key={item.id}
              className="border-b border-[#00FFFF]/10 hover:bg-[#00FFFF]/5 transition-colors"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="rounded border-[#00FFFF]/30 bg-transparent text-[#00FFFF] focus:ring-[#00FFFF]/50"
                />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm text-gray-300 capitalize">
                    {item.status}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium uppercase
                  ${getPriorityColor(item.priority)}
                `}>
                  {item.priority}
                </span>
              </td>
              <td className="p-4">
                <div>
                  <div className="text-white font-medium text-sm">
                    {item.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Deal ID: {item.dealId}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm text-gray-300">
                  {formatDate(item.dueDate)}
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {item.documents.length} files
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onItemAction(item.id, 'review')}
                    className="text-xs px-3 py-1 rounded bg-[#00FFFF]/20 text-[#00FFFF] hover:bg-[#00FFFF]/30 transition-colors"
                  >
                    REVIEW
                  </button>
                  <button
                    onClick={() => onItemAction(item.id, 'approve')}
                    className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    APPROVE
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No compliance items found</div>
          <div className="text-sm text-gray-500">All deals are compliant</div>
        </div>
      )}
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { ComplianceTable } from '@/components/ComplianceTable'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'

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

export default function CompliancePage() {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setLoading(true)
      const deals = await supabaseClient.getDeals({ status: 'active' })
      
      // Transform deals into compliance items
      const items: ComplianceItem[] = deals.map(deal => ({
        id: `comp_${deal.id}`,
        dealId: deal.id,
        type: deal.type || 'General',
        status: deal.compliance_status || 'pending',
        priority: deal.priority || 'medium',
        description: deal.description || 'Compliance review required',
        dueDate: deal.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Karen Martinez',
        documents: deal.documents || [],
        lastUpdated: deal.updated_at || new Date().toISOString()
      }))

      setComplianceItems(items)
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerComplianceReview = async (itemIds: string[]) => {
    try {
      const result = await mcpRouter.invokeAgent('compliance', {
        action: 'review_items',
        item_ids: itemIds,
        reviewer: 'Karen Martinez'
      })

      if (result.success) {
        console.log('Compliance review triggered:', result.data)
        loadComplianceData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to trigger compliance review:', error)
    }
  }

  const runFullAudit = async () => {
    try {
      const result = await mcpRouter.invokeAgent('compliance', {
        action: 'full_audit',
        scope: 'all_active_deals'
      })

      if (result.success) {
        console.log('Full audit initiated:', result.data)
        loadComplianceData()
      }
    } catch (error) {
      console.error('Failed to run full audit:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#00FFFF] font-orbitron">Loading Compliance Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold gradient-text">
            COMPLIANCE CONTROL
          </h1>
          <p className="text-gray-400 mt-2">
            Karen's automated compliance monitoring and validation system
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runFullAudit}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            FULL AUDIT
          </button>
          <button 
            onClick={() => triggerComplianceReview(selectedItems)}
            disabled={selectedItems.length === 0}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors
              ${selectedItems.length === 0 
                ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed' 
                : 'bg-[#FFA500]/20 border border-[#FFA500] text-[#FFA500] hover:bg-[#FFA500]/30'
              }
            `}
          >
            REVIEW SELECTED ({selectedItems.length})
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-red-400 mb-2">
              {complianceItems.filter(item => item.priority === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">Critical Issues</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-yellow-400 mb-2">
              {complianceItems.filter(item => item.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending Review</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-green-400 mb-2">
              {complianceItems.filter(item => item.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-[#00FFFF] mb-2">
              {Math.round((complianceItems.filter(item => item.status === 'approved').length / complianceItems.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-400">Compliance Rate</div>
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="card-bg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-xl font-semibold text-white">
            COMPLIANCE ITEMS
          </h2>
          <div className="flex gap-4 text-sm">
            <button className="text-[#00FFFF] hover:text-[#00CED1]">
              Filter
            </button>
            <button className="text-[#00FFFF] hover:text-[#00CED1]">
              Export
            </button>
            <button 
              onClick={loadComplianceData}
              className="text-[#00FFFF] hover:text-[#00CED1]"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <ComplianceTable 
          items={complianceItems}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onItemAction={(itemId, action) => {
            if (action === 'review') {
              triggerComplianceReview([itemId])
            }
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          KAREN'S QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => triggerComplianceReview(complianceItems.filter(item => item.priority === 'critical').map(item => item.id))}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Review Critical</div>
          </button>
          <button 
            onClick={() => triggerComplianceReview(complianceItems.filter(item => item.status === 'pending').map(item => item.id))}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Process Pending</div>
          </button>
          <button 
            onClick={runFullAudit}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Generate Report</div>
          </button>
          <button 
            onClick={() => console.log('Document validation triggered')}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Validate Docs</div>
          </button>
        </div>
      </div>

      {/* Agent Status */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          COMPLIANCE AGENT STATUS
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            <div>
              <div className="text-white font-medium">Karen Martinez - Compliance Agent</div>
              <div className="text-sm text-gray-400">Active • Processing 3 items • 94% accuracy</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#00FFFF] font-orbitron font-bold">127</div>
            <div className="text-xs text-gray-400">Items Processed Today</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { InvestmentPanel } from '@/components/InvestmentPanel'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'

interface Deal {
  id: string
  type: string
  status: string
  description: string
  priority: string
  metadata: {
    price?: number
    sqft?: number
    roi_projection?: number
  }
  created_at: string
  updated_at: string
}

export default function InvestmentsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [agentStatus, setAgentStatus] = useState<any>(null)

  useEffect(() => {
    loadInvestmentData()
    loadAgentStatus()
    const interval = setInterval(() => {
      loadInvestmentData()
      loadAgentStatus()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadInvestmentData = async () => {
    try {
      const data = await supabaseClient.getDeals({ type: 'investment' })
      setDeals(data)
    } catch (error) {
      console.error('Failed to load investment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAgentStatus = async () => {
    try {
      const result = await mcpRouter.getAgentStatus('investments')
      if (result.success) {
        setAgentStatus(result.data)
      }
    } catch (error) {
      console.error('Failed to load agent status:', error)
    }
  }

  const runMarketAnalysis = async () => {
    try {
      const result = await mcpRouter.invokeAgent('investments', {
        action: 'market_analysis',
        scope: 'all_active_deals'
      })
      console.log('Market analysis triggered:', result)
      if (result.success) {
        setAnalysisResults(result.data)
        loadInvestmentData()
      }
    } catch (error) {
      console.error('Failed to run market analysis:', error)
    }
  }

  const runROIProjection = async () => {
    try {
      const result = await mcpRouter.invokeAgent('investments', {
        action: 'roi_projection',
        deals: deals.map(d => d.id)
      })
      console.log('ROI projection triggered:', result)
      if (result.success) {
        setAnalysisResults(result.data)
        loadInvestmentData()
      }
    } catch (error) {
      console.error('Failed to run ROI projection:', error)
    }
  }

  const runRiskAssessment = async () => {
    try {
      const result = await mcpRouter.invokeAgent('investments', {
        action: 'risk_assessment',
        portfolio: deals
      })
      console.log('Risk assessment triggered:', result)
      if (result.success) {
        setAnalysisResults(result.data)
      }
    } catch (error) {
      console.error('Failed to run risk assessment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#00FFFF] font-orbitron">Loading Investment Data...</p>
        </div>
      </div>
    )
  }

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.metadata?.price || 0), 0)
  }

  const getAverageROI = () => {
    const rois = deals.filter(d => d.metadata?.roi_projection).map(d => d.metadata!.roi_projection!)
    return rois.length > 0 ? rois.reduce((sum, roi) => sum + roi, 0) / rois.length : 0
  }

  const getHighPriorityCount = () => {
    return deals.filter(deal => deal.priority === 'high').length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold gradient-text">
            INVESTMENT ANALYSIS
          </h1>
          <p className="text-gray-400 mt-2">
            Kevin's commercial deal analysis and post-disaster rebuild management
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runMarketAnalysis}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            MARKET ANALYSIS
          </button>
          <button 
            onClick={runROIProjection}
            className="bg-green-500/20 border border-green-400 text-green-400 px-6 py-3 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
          >
            ROI PROJECTION
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-green-400 mb-2">
              {deals.length}
            </div>
            <div className="text-sm text-gray-400">Active Deals</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-[#00FFFF] mb-2">
              ${(getTotalValue() / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400">Portfolio Value</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-400 mb-2">
              {getAverageROI().toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Avg ROI Projection</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-yellow-400 mb-2">
              {getHighPriorityCount()}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      {agentStatus && (
        <div className="card-bg rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-orbitron text-lg font-semibold text-white mb-2">
                KEVIN CHEN - INVESTMENT AGENT
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${agentStatus.status === 'active' ? 'bg-green-400 animate-pulse' : agentStatus.status === 'idle' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                  <span className="text-gray-300">{agentStatus.status?.toUpperCase()}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">Last Activity: {agentStatus.last_execution}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">Queue: {agentStatus.queue_size} items</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#00FFFF] font-orbitron font-bold text-2xl">
                {agentStatus.deals_analyzed_today || 0}
              </div>
              <div className="text-xs text-gray-400">Deals Analyzed Today</div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Panel */}
      <InvestmentPanel 
        deals={deals}
        onAnalysisComplete={setAnalysisResults}
        analysisResults={analysisResults}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={runMarketAnalysis}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Market Analysis</div>
          </button>
          <button 
            onClick={runROIProjection}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">ROI Projection</div>
          </button>
          <button 
            onClick={runRiskAssessment}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Risk Assessment</div>
          </button>
          <button 
            onClick={() => loadInvestmentData()}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Refresh Data</div>
          </button>
        </div>
      </div>
    </div>
  )
} 
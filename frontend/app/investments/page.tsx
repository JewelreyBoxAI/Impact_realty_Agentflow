'use client'

import React, { useState, useEffect } from 'react'
import { InvestmentPanel } from '@/components/InvestmentPanel'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { KPIWidget } from '@/components/KPIWidget'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'
import { Investment } from '@/types/database'
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react'

export default function InvestmentsPage() {
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [investmentMetrics, setInvestmentMetrics] = useState({
    totalInvestments: 0,
    totalValue: 0,
    averageROI: 0,
    activeInvestments: 0
  })

  useEffect(() => {
    loadInvestmentData()
    const interval = setInterval(loadInvestmentData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadInvestmentData = async () => {
    try {
      const investmentData = await supabaseClient.getInvestments()
      setInvestments(investmentData)
      
      // Calculate metrics
      const totalValue = investmentData.reduce((sum, inv) => sum + inv.investmentAmount, 0)
      const avgROI = investmentData.length > 0 
        ? investmentData.reduce((sum, inv) => sum + inv.expectedROI, 0) / investmentData.length 
        : 0
      const active = investmentData.filter(inv => 
        ['analyzing', 'approved', 'in_progress'].includes(inv.status)
      ).length
      
      setInvestmentMetrics({
        totalInvestments: investmentData.length,
        totalValue,
        averageROI: Math.round(avgROI * 10) / 10,
        activeInvestments: active
      })
    } catch (error) {
      console.error('Failed to load investment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runInvestmentAnalysis = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('investment_analysis', {
        type: 'portfolio_review',
        priority: 'high'
      })
      
      if (result.success) {
        console.log('Investment analysis started:', result.data)
      }
    } catch (error) {
      console.error('Failed to run investment analysis:', error)
    }
  }

  const generateInvestmentReport = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('investment_report', {
        period: 'quarterly',
        includeProjections: true
      })
      
      if (result.success) {
        console.log('Investment report generated:', result.data)
      }
    } catch (error) {
      console.error('Failed to generate investment report:', error)
    }
  }

  const handleInvestmentAction = async (investmentId: string, action: string) => {
    try {
      const result = await mcpRouter.executeWorkflow('investment_action', {
        investmentId,
        action,
        priority: 'medium'
      })
      
      if (result.success) {
        console.log(`Investment ${investmentId} action ${action} completed:`, result.data)
        loadInvestmentData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to execute investment action ${action}:`, error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-primary-500 font-orbitron">Loading Investment Data...</p>
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
            INVESTMENT ANALYTICS
          </h1>
          <p className="section-subtitle">
            Kevin Agent - Investment analysis and portfolio management
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runInvestmentAnalysis}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            RUN ANALYSIS
          </button>
          <button 
            onClick={generateInvestmentReport}
            className="bg-green-500/20 border border-green-500 text-green-400 px-6 py-3 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
          >
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Investment Metrics */}
      <div className="stats-grid">
        <KPIWidget
          title="Total Investments"
          value={investmentMetrics.totalInvestments}
          icon={<PieChart className="w-5 h-5" />}
          color="primary"
        />
        <KPIWidget
          title="Portfolio Value"
          value={investmentMetrics.totalValue}
          format="currency"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Average ROI"
          value={investmentMetrics.averageROI}
          format="percentage"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Active Investments"
          value={investmentMetrics.activeInvestments}
          trend="stable"
          icon={<BarChart3 className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Agent Status */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          KEVIN AGENT STATUS
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentStatusCard 
            agentId="investments" 
            showDetails={true}
            onAction={(action) => console.log('Investment agent action:', action)}
          />
          <div className="card-bg rounded-2xl p-6">
            <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
              RECENT ACTIVITIES
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Analyzed 5 new investment opportunities</span>
                <span className="text-gray-500 ml-auto">10 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <PieChart className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Updated portfolio risk assessment</span>
                <span className="text-gray-500 ml-auto">30 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Generated ROI projections for Q4</span>
                <span className="text-gray-500 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Completed market analysis report</span>
                <span className="text-gray-500 ml-auto">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Portfolio */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary-500" />
          INVESTMENT PORTFOLIO
        </h2>
        <InvestmentPanel 
          investments={investments}
          onInvestmentAction={handleInvestmentAction}
        />
      </div>
    </div>
  )
} 
'use client'

import React, { useState, useEffect } from 'react'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { KPIWidget } from '@/components/KPIWidget'
import { mcpRouter } from '@/utils/mcpRouter'
import { supabaseClient } from '@/utils/supabaseClient'
import { Activity, Users, DollarSign, Shield } from 'lucide-react'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState({
    totalDeals: 156,
    activeAgents: 4,
    monthlyRevenue: 2450000,
    complianceScore: 94
  })

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load system metrics and agent statuses
      const [agentStatuses, deals] = await Promise.all([
        supabaseClient.getAgentStatuses(),
        supabaseClient.getDeals()
      ])

      // Update metrics based on real data
      setSystemMetrics({
        totalDeals: deals.length,
        activeAgents: agentStatuses.filter(a => a.status === 'active').length,
        monthlyRevenue: deals.reduce((sum, deal) => sum + (deal.finalAmount || deal.offerAmount), 0),
        complianceScore: 94 // This would come from compliance agent
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowType: string) => {
    try {
      const result = await mcpRouter.executeWorkflow(workflowType, {
        priority: 'high',
        timestamp: new Date().toISOString()
      })
      
      if (result.success) {
        console.log('Workflow executed:', result.data)
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-primary-500 font-orbitron">Loading Dashboard...</p>
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
            MISSION CONTROL
          </h1>
          <p className="section-subtitle">
            Real-time oversight of all agent operations
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => executeWorkflow('daily_report')}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            GENERATE REPORT
          </button>
          <button 
            onClick={() => executeWorkflow('system_health_check')}
            className="bg-green-500/20 border border-green-500 text-green-400 px-6 py-3 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
          >
            HEALTH CHECK
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="stats-grid">
        <KPIWidget
          title="Total Deals"
          value={systemMetrics.totalDeals}
          trend="up"
          icon={<Activity className="w-5 h-5" />}
          color="primary"
        />
        <KPIWidget
          title="Active Agents"
          value={systemMetrics.activeAgents}
          subtitle="All systems operational"
          icon={<Users className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Monthly Revenue"
          value={systemMetrics.monthlyRevenue}
          format="currency"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Compliance Score"
          value={systemMetrics.complianceScore}
          format="percentage"
          trend="stable"
          icon={<Shield className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Agent Status Grid */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          AGENT STATUS OVERVIEW
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentStatusCard 
            agentId="supervisor" 
            showDetails={true}
            onAction={(action) => console.log('Supervisor action:', action)}
          />
          <AgentStatusCard 
            agentId="compliance" 
            onAction={(action) => console.log('Compliance action:', action)}
          />
          <AgentStatusCard 
            agentId="recruiting" 
            onAction={(action) => console.log('Recruiting action:', action)}
          />
          <AgentStatusCard 
            agentId="investments" 
            onAction={(action) => console.log('Investments action:', action)}
          />
          <AgentStatusCard 
            agentId="communication" 
            onAction={(action) => console.log('Communication action:', action)}
          />
          <AgentStatusCard 
            agentId="analytics" 
            onAction={(action) => console.log('Analytics action:', action)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => executeWorkflow('compliance_audit')}
            className="quick-action-btn"
          >
            <div className="text-sm font-medium">Compliance Audit</div>
          </button>
          <button 
            onClick={() => executeWorkflow('recruiting_outreach')}
            className="quick-action-btn"
          >
            <div className="text-sm font-medium">Recruiting Outreach</div>
          </button>
          <button 
            onClick={() => executeWorkflow('investment_analysis')}
            className="quick-action-btn"
          >
            <div className="text-sm font-medium">Investment Analysis</div>
          </button>
          <button 
            onClick={() => executeWorkflow('system_backup')}
            className="quick-action-btn"
          >
            <div className="text-sm font-medium">System Backup</div>
          </button>
        </div>
      </div>
    </div>
  )
} 
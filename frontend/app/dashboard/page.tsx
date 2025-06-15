'use client'

import React, { useState, useEffect } from 'react'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { KPIWidget } from '@/components/KPIWidget'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'

interface AgentStatus {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'error'
  lastActivity: string
  tasksCompleted: number
  successRate: number
}

interface KPIData {
  openComplianceItems: number
  recruitingPipelineStages: number
  activeDeals: number
  investmentActivity: number
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [kpis, setKpis] = useState<KPIData>({
    openComplianceItems: 0,
    recruitingPipelineStages: 0,
    activeDeals: 0,
    investmentActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load agent statuses
      const agentData = await supabaseClient.getAgentStatuses()
      setAgents(agentData)

      // Load KPI data
      const kpiData = await supabaseClient.getKPIData()
      setKpis(kpiData)

      setLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowType: string, params: any) => {
    try {
      const result = await mcpRouter.invokeAgent('supervisor', {
        workflow_type: workflowType,
        params
      })
      console.log('Workflow executed:', result)
      // Refresh data after workflow execution
      loadDashboardData()
    } catch (error) {
      console.error('Workflow execution failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#00FFFF] font-orbitron">Loading Agent Status...</p>
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
            SUPERVISOR DASHBOARD
          </h1>
          <p className="text-gray-400 mt-2">
            Hierarchical agent orchestration and control center
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => executeWorkflow('health_check', {})}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            SYSTEM CHECK
          </button>
          <button 
            onClick={() => executeWorkflow('emergency_stop', {})}
            className="bg-red-500/20 border border-red-500 text-red-400 px-6 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
          >
            EMERGENCY STOP
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Compliance Items"
          value={kpis.openComplianceItems}
          trend="up"
          color="red"
          onClick={() => executeWorkflow('compliance_scan', {})}
        />
        <KPIWidget
          title="Recruiting Pipeline"
          value={kpis.recruitingPipelineStages}
          trend="up"
          color="blue"
          onClick={() => executeWorkflow('recruiting_update', {})}
        />
        <KPIWidget
          title="Active Deals"
          value={kpis.activeDeals}
          trend="stable"
          color="green"
          onClick={() => executeWorkflow('deal_review', {})}
        />
        <KPIWidget
          title="Investment Activity"
          value={kpis.investmentActivity}
          trend="up"
          color="purple"
          onClick={() => executeWorkflow('investment_analysis', {})}
        />
      </div>

      {/* Agent Status Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-orbitron text-xl font-semibold text-white">
            AGENT STATUS MATRIX
          </h2>
          <button 
            onClick={loadDashboardData}
            className="text-[#00FFFF] hover:text-[#00CED1] text-sm font-medium"
          >
            REFRESH STATUS
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentStatusCard
              key={agent.id}
              agent={agent}
              onExecute={(action) => executeWorkflow(action, { agentId: agent.id })}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => executeWorkflow('candidate_outreach', {})}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Candidate Outreach</div>
          </button>
          <button 
            onClick={() => executeWorkflow('compliance_audit', {})}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Compliance Audit</div>
          </button>
          <button 
            onClick={() => executeWorkflow('deal_analysis', {})}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Deal Analysis</div>
          </button>
          <button 
            onClick={() => executeWorkflow('market_research', {})}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Market Research</div>
          </button>
        </div>
      </div>

      {/* System Architecture Visualization */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-6">
          HIERARCHICAL ARCHITECTURE
        </h3>
        <div className="grid-pattern rounded-lg p-8">
          <div className="flex flex-col items-center space-y-8">
            {/* Supervisor Level */}
            <div className="agent-card p-4 w-64 text-center">
              <div className="font-orbitron font-bold text-[#00FFFF]">SUPERVISOR</div>
              <div className="text-sm text-gray-400">Kevin's Control Center</div>
            </div>
            
            {/* Agent Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <div className="agent-card p-4 text-center">
                <div className="font-orbitron font-semibold text-[#00CED1]">COMPLIANCE</div>
                <div className="text-xs text-gray-400">Karen's Domain</div>
              </div>
              <div className="agent-card p-4 text-center">
                <div className="font-orbitron font-semibold text-[#00CED1]">RECRUITING</div>
                <div className="text-xs text-gray-400">Eileen's Pipeline</div>
              </div>
              <div className="agent-card p-4 text-center">
                <div className="font-orbitron font-semibold text-[#00CED1]">INVESTMENTS</div>
                <div className="text-xs text-gray-400">Commercial Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
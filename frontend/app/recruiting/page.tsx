'use client'

import React, { useState, useEffect } from 'react'
import { RecruitingPipeline } from '@/components/RecruitingPipeline'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { KPIWidget } from '@/components/KPIWidget'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'
import { Candidate } from '@/types/database'
import { Users, UserPlus, Calendar, Target } from 'lucide-react'

export default function RecruitingPage() {
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [recruitingMetrics, setRecruitingMetrics] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    hiredThisMonth: 0,
    conversionRate: 0
  })

  useEffect(() => {
    loadRecruitingData()
    const interval = setInterval(loadRecruitingData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadRecruitingData = async () => {
    try {
      const candidateData = await supabaseClient.getCandidates()
      setCandidates(candidateData)
      
      // Calculate metrics
      const active = candidateData.filter(c => 
        ['lead', 'contacted', 'interviewed', 'offer_made'].includes(c.status)
      ).length
      const hired = candidateData.filter(c => c.status === 'hired').length
      const conversion = candidateData.length > 0 ? (hired / candidateData.length) * 100 : 0
      
      setRecruitingMetrics({
        totalCandidates: candidateData.length,
        activeCandidates: active,
        hiredThisMonth: hired,
        conversionRate: Math.round(conversion)
      })
    } catch (error) {
      console.error('Failed to load recruiting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startRecruitingCampaign = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('recruiting_campaign', {
        type: 'outreach',
        priority: 'high'
      })
      
      if (result.success) {
        console.log('Recruiting campaign started:', result.data)
      }
    } catch (error) {
      console.error('Failed to start recruiting campaign:', error)
    }
  }

  const generateRecruitingReport = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('recruiting_report', {
        period: 'monthly',
        includeMetrics: true
      })
      
      if (result.success) {
        console.log('Recruiting report generated:', result.data)
      }
    } catch (error) {
      console.error('Failed to generate recruiting report:', error)
    }
  }

  const handleCandidateAction = async (candidateId: string, action: string) => {
    try {
      const result = await mcpRouter.executeWorkflow('candidate_action', {
        candidateId,
        action,
        priority: 'medium'
      })
      
      if (result.success) {
        console.log(`Candidate ${candidateId} action ${action} completed:`, result.data)
        loadRecruitingData() // Refresh data
      }
    } catch (error) {
      console.error(`Failed to execute candidate action ${action}:`, error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-primary-500 font-orbitron">Loading Recruiting Data...</p>
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
            TALENT ACQUISITION
          </h1>
          <p className="section-subtitle">
            Eileen Agent - Recruiting and talent management
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startRecruitingCampaign}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            START CAMPAIGN
          </button>
          <button 
            onClick={generateRecruitingReport}
            className="bg-purple-500/20 border border-purple-500 text-purple-400 px-6 py-3 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
          >
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Recruiting Metrics */}
      <div className="stats-grid">
        <KPIWidget
          title="Total Candidates"
          value={recruitingMetrics.totalCandidates}
          icon={<Users className="w-5 h-5" />}
          color="primary"
        />
        <KPIWidget
          title="Active Pipeline"
          value={recruitingMetrics.activeCandidates}
          trend="up"
          icon={<UserPlus className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Hired This Month"
          value={recruitingMetrics.hiredThisMonth}
          trend="up"
          icon={<Target className="w-5 h-5" />}
          color="success"
        />
        <KPIWidget
          title="Conversion Rate"
          value={recruitingMetrics.conversionRate}
          format="percentage"
          trend="stable"
          icon={<Calendar className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Agent Status */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          EILEEN AGENT STATUS
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentStatusCard 
            agentId="recruiting" 
            showDetails={true}
            onAction={(action) => console.log('Recruiting agent action:', action)}
          />
          <div className="card-bg rounded-2xl p-6">
            <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
              RECENT ACTIVITIES
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <UserPlus className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Added 3 new candidates to pipeline</span>
                <span className="text-gray-500 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Scheduled interview with Sarah Johnson</span>
                <span className="text-gray-500 ml-auto">20 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Sent follow-up to 5 candidates</span>
                <span className="text-gray-500 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Updated recruiting campaign metrics</span>
                <span className="text-gray-500 ml-auto">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiting Pipeline */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          CANDIDATE PIPELINE
        </h2>
        <RecruitingPipeline 
          candidates={candidates}
          onCandidateAction={handleCandidateAction}
        />
      </div>
    </div>
  )
} 
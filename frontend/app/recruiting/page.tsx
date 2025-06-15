'use client'

import React, { useState, useEffect } from 'react'
import { RecruitingPipeline } from '@/components/RecruitingPipeline'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: string
  score: number
  experience: string
  location: string
  notes: string
  created_at: string
}

export default function RecruitingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [agentStatus, setAgentStatus] = useState<any>(null)

  useEffect(() => {
    loadRecruitingData()
    loadAgentStatus()
    const interval = setInterval(() => {
      loadRecruitingData()
      loadAgentStatus()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadRecruitingData = async () => {
    try {
      const data = await supabaseClient.getCandidates()
      setCandidates(data)
    } catch (error) {
      console.error('Failed to load recruiting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAgentStatus = async () => {
    try {
      const result = await mcpRouter.getAgentStatus('recruiting')
      if (result.success) {
        setAgentStatus(result.data)
      }
    } catch (error) {
      console.error('Failed to load agent status:', error)
    }
  }

  const triggerOutreach = async () => {
    try {
      const result = await mcpRouter.invokeAgent('recruiting', {
        action: 'candidate_outreach',
        target_count: 10
      })
      console.log('Outreach triggered:', result)
      if (result.success) {
        loadRecruitingData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to trigger outreach:', error)
    }
  }

  const runQualificationScan = async () => {
    try {
      const result = await mcpRouter.invokeAgent('recruiting', {
        action: 'qualification_scan',
        scope: 'all_new_candidates'
      })
      console.log('Qualification scan triggered:', result)
      if (result.success) {
        loadRecruitingData()
      }
    } catch (error) {
      console.error('Failed to run qualification scan:', error)
    }
  }

  const handleCandidateAction = async (candidateId: string, action: string) => {
    try {
      const result = await mcpRouter.invokeAgent('recruiting', {
        action: 'candidate_action',
        candidate_id: candidateId,
        action_type: action
      })
      
      if (result.success) {
        console.log('Candidate action completed:', result.data)
        loadRecruitingData() // Refresh data
      }
    } catch (error) {
      console.error('Candidate action failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#00FFFF] font-orbitron">Loading Recruiting Pipeline...</p>
        </div>
      </div>
    )
  }

  const getStageCount = (stage: string) => {
    return candidates.filter(candidate => candidate.status === stage).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold gradient-text">
            RECRUITING PIPELINE
          </h1>
          <p className="text-gray-400 mt-2">
            Eileen's automated candidate sourcing and qualification system
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runQualificationScan}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            QUALIFICATION SCAN
          </button>
          <button 
            onClick={triggerOutreach}
            className="bg-purple-500/20 border border-purple-400 text-purple-400 px-6 py-3 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
          >
            RUN OUTREACH
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-blue-400 mb-2">
              {getStageCount('new')}
            </div>
            <div className="text-sm text-gray-400">New Leads</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-yellow-400 mb-2">
              {getStageCount('screening')}
            </div>
            <div className="text-sm text-gray-400">Screening</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-400 mb-2">
              {getStageCount('interview')}
            </div>
            <div className="text-sm text-gray-400">Interview</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-green-400 mb-2">
              {getStageCount('qualified')}
            </div>
            <div className="text-sm text-gray-400">Qualified</div>
          </div>
        </div>
        <div className="card-bg rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl font-orbitron font-bold text-[#00FFFF] mb-2">
              {candidates.length}
            </div>
            <div className="text-sm text-gray-400">Total Pipeline</div>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      {agentStatus && (
        <div className="card-bg rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-orbitron text-lg font-semibold text-white mb-2">
                EILEEN RODRIGUEZ - RECRUITING AGENT
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${agentStatus.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
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
                {agentStatus.candidates_processed_today || 0}
              </div>
              <div className="text-xs text-gray-400">Candidates Processed Today</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Component */}
      <RecruitingPipeline 
        candidates={candidates}
        onCandidateAction={handleCandidateAction}
      />

      {/* Quick Actions */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => triggerOutreach()}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Mass Outreach</div>
          </button>
          <button 
            onClick={() => runQualificationScan()}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Qualify Leads</div>
          </button>
          <button 
            onClick={() => loadRecruitingData()}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Refresh Data</div>
          </button>
          <button 
            onClick={() => mcpRouter.invokeAgent('recruiting', { action: 'generate_report' })}
            className="neon-button p-4 rounded-lg text-center"
          >
            <div className="text-sm font-medium">Generate Report</div>
          </button>
        </div>
      </div>
    </div>
  )
} 
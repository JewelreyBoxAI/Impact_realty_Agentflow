'use client'

import React from 'react'
import { User, Mail, Phone, Calendar, Star } from 'lucide-react'

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

interface RecruitingPipelineProps {
  candidates: Candidate[]
  onCandidateAction: (candidateId: string, action: string) => void
}

export function RecruitingPipeline({ candidates, onCandidateAction }: RecruitingPipelineProps) {
  const stages = [
    { id: 'new', name: 'New Leads', color: 'blue' },
    { id: 'screening', name: 'Screening', color: 'yellow' },
    { id: 'interview', name: 'Interview', color: 'purple' },
    { id: 'qualified', name: 'Qualified', color: 'green' },
    { id: 'hired', name: 'Hired', color: 'cyan' }
  ]

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => candidate.status === stage)
  }

  const getStageColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-400/50 bg-blue-400/10'
      case 'yellow':
        return 'border-yellow-400/50 bg-yellow-400/10'
      case 'purple':
        return 'border-purple-400/50 bg-purple-400/10'
      case 'green':
        return 'border-green-400/50 bg-green-400/10'
      case 'cyan':
        return 'border-cyan-400/50 bg-cyan-400/10'
      default:
        return 'border-gray-400/50 bg-gray-400/10'
    }
  }

  const renderStars = (score: number) => {
    const stars: React.ReactElement[] = []
    const fullStars = Math.floor(score / 20)
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
        />
      )
    }
    return stars
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageCount = getCandidatesByStage(stage.id).length
          return (
            <div key={stage.id} className={`card-bg rounded-xl p-4 ${getStageColor(stage.color)}`}>
              <div className="text-center">
                <div className="text-2xl font-orbitron font-bold text-white mb-1">
                  {stageCount}
                </div>
                <div className="text-sm text-gray-300">
                  {stage.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id)
          
          return (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron font-semibold text-white">
                  {stage.name.toUpperCase()}
                </h3>
                <span className="text-sm text-gray-400">
                  {stageCandidates.length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {stageCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`
                      card-bg rounded-lg p-4 border transition-all duration-200
                      hover:border-[#00FFFF]/50 hover:shadow-lg cursor-pointer
                      ${getStageColor(stage.color)}
                    `}
                  >
                    {/* Candidate Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#00FFFF]" />
                        <div>
                          <div className="font-medium text-white text-sm">
                            {candidate.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {candidate.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {renderStars(candidate.score)}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{candidate.phone}</span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Experience</div>
                      <div className="text-xs text-gray-300">
                        {candidate.experience || 'Not specified'}
                      </div>
                    </div>

                    {/* Notes */}
                    {candidate.notes && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Notes</div>
                        <div className="text-xs text-gray-300 line-clamp-2">
                          {candidate.notes}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-[#00FFFF]/10">
                      <button
                        onClick={() => onCandidateAction(candidate.id, 'contact')}
                        className="flex-1 text-xs py-1 px-2 rounded bg-[#00FFFF]/20 text-[#00FFFF] hover:bg-[#00FFFF]/30 transition-colors"
                      >
                        CONTACT
                      </button>
                      <button
                        onClick={() => onCandidateAction(candidate.id, 'schedule')}
                        className="flex-1 text-xs py-1 px-2 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                      >
                        SCHEDULE
                      </button>
                    </div>
                  </div>
                ))}
                
                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Eileen's Agent Status */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          RECRUITING AGENT STATUS
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
            <div>
              <div className="text-white font-medium">Eileen Rodriguez - Recruiting Agent</div>
              <div className="text-sm text-gray-400">Active • Processing 8 candidates • 87% success rate</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#00FFFF] font-orbitron font-bold">42</div>
            <div className="text-xs text-gray-400">Candidates Sourced This Week</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
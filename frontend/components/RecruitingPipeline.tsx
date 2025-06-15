'use client'

import React, { useState } from 'react'
import { User, Phone, Mail, MapPin, Calendar, Star } from 'lucide-react'
import { Candidate } from '@/types/database'

interface RecruitingPipelineProps {
  candidates: Candidate[]
  onCandidateAction?: (candidateId: string, action: string) => void
}

const PIPELINE_STAGES = [
  { key: 'prospecting', label: 'Prospecting', color: 'bg-gray-500' },
  { key: 'qualification', label: 'Qualification', color: 'bg-blue-500' },
  { key: 'interview', label: 'Interview', color: 'bg-yellow-500' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { key: 'onboarding', label: 'Onboarding', color: 'bg-green-500' }
]

export function RecruitingPipeline({ candidates, onCandidateAction }: RecruitingPipelineProps) {
  const [selectedStage, setSelectedStage] = useState<string>('all')

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => candidate.stage === stage)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired':
        return 'text-green-400 bg-green-400/10'
      case 'offer_made':
        return 'text-blue-400 bg-blue-400/10'
      case 'interviewed':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'contacted':
        return 'text-orange-400 bg-orange-400/10'
      case 'lead':
        return 'text-gray-400 bg-gray-400/10'
      case 'rejected':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <div className="card-bg rounded-xl p-4 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h4 className="font-semibold text-white">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-gray-400">{candidate.source}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
          {candidate.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Mail className="w-4 h-4" />
          <span>{candidate.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Phone className="w-4 h-4" />
          <span>{candidate.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <MapPin className="w-4 h-4" />
          <span>{candidate.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Star className="w-4 h-4" />
          <span>{candidate.experience} years experience</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-1">Skills</div>
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-gray-700 text-xs rounded">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-xs rounded">
              +{candidate.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-400">Expected Salary:</span>
        <span className="text-white font-medium">{formatSalary(candidate.expectedSalary)}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Last Contact: {new Date(candidate.lastContact).toLocaleDateString()}</span>
        {candidate.nextFollowUp && (
          <span>Next: {new Date(candidate.nextFollowUp).toLocaleDateString()}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onCandidateAction?.(candidate.id, 'contact')}
          className="flex-1 bg-primary-500/20 border border-primary-500 text-primary-400 py-2 px-3 rounded text-sm font-medium hover:bg-primary-500/30 transition-colors"
        >
          CONTACT
        </button>
        <button
          onClick={() => onCandidateAction?.(candidate.id, 'schedule')}
          className="flex-1 bg-gray-600/20 border border-gray-600 text-gray-300 py-2 px-3 rounded text-sm font-medium hover:bg-gray-600/30 transition-colors"
        >
          SCHEDULE
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stage Filter */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStage('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedStage === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Candidates ({candidates.length})
        </button>
        {PIPELINE_STAGES.map(stage => {
          const count = getCandidatesByStage(stage.key).length
          return (
            <button
              key={stage.key}
              onClick={() => setSelectedStage(stage.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedStage === stage.key 
                  ? `${stage.color} text-white` 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {stage.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Pipeline View */}
      {selectedStage === 'all' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {PIPELINE_STAGES.map(stage => {
            const stageCandidates = getCandidatesByStage(stage.key)
            return (
              <div key={stage.key} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-orbitron font-semibold text-white">
                    {stage.label}
                  </h3>
                  <span className="text-sm text-gray-400">({stageCandidates.length})</span>
                </div>
                <div className="space-y-3">
                  {stageCandidates.map(candidate => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCandidatesByStage(selectedStage).map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
          {getCandidatesByStage(selectedStage).length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No candidates found in this stage
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
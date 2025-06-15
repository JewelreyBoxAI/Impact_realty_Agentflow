'use client'

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'
import { Investment } from '@/types/database'

interface InvestmentPanelProps {
  investments: Investment[]
  onInvestmentAction?: (investmentId: string, action: string) => void
}

export function InvestmentPanel({ investments, onInvestmentAction }: InvestmentPanelProps) {
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10'
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10'
      case 'approved':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'analyzing':
        return 'text-orange-400 bg-orange-400/10'
      case 'cancelled':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const filteredInvestments = investments.filter(investment => 
    filterStatus === 'all' || investment.status === filterStatus
  )

  const InvestmentCard = ({ investment }: { investment: Investment }) => (
    <div className="card-bg rounded-xl p-6 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-orbitron font-semibold text-white mb-1">
            {investment.type.replace('_', ' ').toUpperCase()}
          </h4>
          <p className="text-sm text-gray-400">ID: {investment.id.slice(0, 8)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
          {investment.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400">Investment Amount</div>
          <div className="text-xl font-orbitron font-bold text-primary-500">
            {formatCurrency(investment.investmentAmount)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Expected ROI</div>
          <div className="text-xl font-orbitron font-bold text-green-400">
            {formatPercentage(investment.expectedROI)}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Risk Level:</span>
          <span className={`font-medium ${getRiskColor(investment.riskLevel)}`}>
            {investment.riskLevel.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">IRR:</span>
          <span className="text-white">{formatPercentage(investment.metrics.irr)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">NPV:</span>
          <span className="text-white">{formatCurrency(investment.metrics.npv)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Payback Period:</span>
          <span className="text-white">{investment.metrics.paybackPeriod} months</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Timeline</div>
        <div className="text-xs text-gray-300">
          <div>Start: {new Date(investment.timeline.startDate).toLocaleDateString()}</div>
          <div>Expected End: {new Date(investment.timeline.expectedEndDate).toLocaleDateString()}</div>
          {investment.timeline.actualEndDate && (
            <div>Actual End: {new Date(investment.timeline.actualEndDate).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedInvestment(investment)}
          className="flex-1 bg-primary-500/20 border border-primary-500 text-primary-400 py-2 px-3 rounded text-sm font-medium hover:bg-primary-500/30 transition-colors"
        >
          VIEW DETAILS
        </button>
        <button
          onClick={() => onInvestmentAction?.(investment.id, 'analyze')}
          className="flex-1 bg-gray-600/20 border border-gray-600 text-gray-300 py-2 px-3 rounded text-sm font-medium hover:bg-gray-600/30 transition-colors"
        >
          ANALYZE
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="analyzing">Analyzing</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="text-sm text-gray-400">
          {filteredInvestments.length} investments
        </div>
      </div>

      {/* Investment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestments.map(investment => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}
      </div>

      {filteredInvestments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No investments found</div>
          <div className="text-sm text-gray-500">
            {filterStatus !== 'all' ? 'Try adjusting your filters' : 'Investments will appear here once created'}
          </div>
        </div>
      )}

      {/* Investment Detail Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-bg rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-orbitron text-xl font-semibold text-white">
                INVESTMENT ANALYSIS
              </h3>
              <button 
                onClick={() => setSelectedInvestment(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-orbitron text-lg font-semibold text-white mb-3">
                    BASIC INFORMATION
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedInvestment.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white capitalize">{selectedInvestment.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Level:</span>
                      <span className={getRiskColor(selectedInvestment.riskLevel)}>
                        {selectedInvestment.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Analyst:</span>
                      <span className="text-white">{selectedInvestment.assignedAnalyst}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div>
                  <h4 className="font-orbitron text-lg font-semibold text-white mb-3">
                    FINANCIAL METRICS
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Investment Amount:</span>
                      <span className="text-primary-500 font-bold">
                        {formatCurrency(selectedInvestment.investmentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected ROI:</span>
                      <span className="text-green-400 font-bold">
                        {formatPercentage(selectedInvestment.expectedROI)}
                      </span>
                    </div>
                    {selectedInvestment.actualROI && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Actual ROI:</span>
                        <span className="text-green-400 font-bold">
                          {formatPercentage(selectedInvestment.actualROI)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">IRR:</span>
                      <span className="text-white">{formatPercentage(selectedInvestment.metrics.irr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NPV:</span>
                      <span className="text-white">{formatCurrency(selectedInvestment.metrics.npv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payback Period:</span>
                      <span className="text-white">{selectedInvestment.metrics.paybackPeriod} months</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Cash Flow */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-orbitron text-lg font-semibold text-white mb-3">
                    TIMELINE
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Start Date:</span>
                      <span className="text-white">
                        {new Date(selectedInvestment.timeline.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected End:</span>
                      <span className="text-white">
                        {new Date(selectedInvestment.timeline.expectedEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedInvestment.timeline.actualEndDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Actual End:</span>
                        <span className="text-white">
                          {new Date(selectedInvestment.timeline.actualEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cash Flow */}
                <div>
                  <h4 className="font-orbitron text-lg font-semibold text-white mb-3">
                    CASH FLOW PROJECTION
                  </h4>
                  <div className="space-y-2">
                    {selectedInvestment.metrics.cashFlow.slice(0, 5).map((flow, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-400">Year {index + 1}:</span>
                        <span className={flow >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatCurrency(flow)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedInvestment.notes && (
              <div className="mt-6">
                <h4 className="font-orbitron text-lg font-semibold text-white mb-3">
                  NOTES
                </h4>
                <p className="text-gray-300">{selectedInvestment.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
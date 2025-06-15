'use client'

import React from 'react'
import { TrendingUp, DollarSign, BarChart3, AlertTriangle } from 'lucide-react'

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

interface InvestmentPanelProps {
  deals?: Deal[]
  onAnalysisComplete: (results: any) => void
  analysisResults?: any
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function InvestmentPanel({ 
  deals = [], 
  onAnalysisComplete, 
  analysisResults, 
  loading, 
  setLoading 
}: InvestmentPanelProps) {
  
  const runAnalysis = async (type: string) => {
    setLoading(true)
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResults = {
        type,
        timestamp: new Date().toISOString(),
        deals_analyzed: deals.length,
        recommendations: [
          'Consider increasing investment in commercial properties',
          'Diversify portfolio with residential opportunities',
          'Monitor market trends for optimal timing'
        ],
        roi_projections: deals.map(deal => ({
          id: deal.id,
          current_roi: deal.metadata?.roi_projection || Math.random() * 20 + 5,
          projected_roi: Math.random() * 25 + 10,
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        }))
      }
      
      onAnalysisComplete(mockResults)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <div className="card-bg rounded-2xl p-6">
        <h2 className="font-orbitron text-xl font-semibold text-white mb-4">
          INVESTMENT ANALYSIS PANEL
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => runAnalysis('market_analysis')}
            disabled={loading}
            className="neon-button p-4 rounded-lg text-center disabled:opacity-50"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Market Analysis</div>
          </button>
          
          <button
            onClick={() => runAnalysis('roi_projection')}
            disabled={loading}
            className="neon-button p-4 rounded-lg text-center disabled:opacity-50"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">ROI Projection</div>
          </button>
          
          <button
            onClick={() => runAnalysis('risk_assessment')}
            disabled={loading}
            className="neon-button p-4 rounded-lg text-center disabled:opacity-50"
          >
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Risk Assessment</div>
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#00FFFF] font-orbitron">Running Analysis...</p>
          </div>
        )}
      </div>

      {/* Active Deals */}
      <div className="card-bg rounded-2xl p-6">
        <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
          ACTIVE INVESTMENT DEALS
        </h3>
        
        {deals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active investment deals found
          </div>
        ) : (
          <div className="space-y-4">
            {deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-white">{deal.description}</span>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded
                    ${deal.priority === 'high' ? 'bg-red-500/20 text-red-400' : 
                      deal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-green-500/20 text-green-400'}
                  `}>
                    {deal.priority?.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                  <div>
                    <div className="text-gray-500">Price</div>
                    <div>${(deal.metadata?.price || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Sq Ft</div>
                    <div>{(deal.metadata?.sqft || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">ROI Projection</div>
                    <div className="text-green-400">{deal.metadata?.roi_projection || 0}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="card-bg rounded-2xl p-6">
          <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
            ANALYSIS RESULTS
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Analysis Type:</span>
              <span className="text-[#00FFFF] font-medium">{analysisResults.type?.toUpperCase()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Deals Analyzed:</span>
              <span className="text-white">{analysisResults.deals_analyzed}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Completed:</span>
              <span className="text-white">{new Date(analysisResults.timestamp).toLocaleString()}</span>
            </div>

            {analysisResults.recommendations && (
              <div>
                <div className="text-gray-400 text-sm mb-2">Recommendations:</div>
                <ul className="space-y-1">
                  {analysisResults.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-[#00FFFF] mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
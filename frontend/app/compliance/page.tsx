'use client'

import React, { useState, useEffect } from 'react'
import { ComplianceTable } from '@/components/ComplianceTable'
import { AgentStatusCard } from '@/components/AgentStatusCard'
import { KPIWidget } from '@/components/KPIWidget'
import { supabaseClient } from '@/utils/supabaseClient'
import { mcpRouter } from '@/utils/mcpRouter'
import { ComplianceRecord } from '@/types/database'
import { Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react'

export default function CompliancePage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<ComplianceRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null)
  const [complianceMetrics, setComplianceMetrics] = useState({
    totalRecords: 0,
    pendingReviews: 0,
    complianceScore: 94,
    criticalIssues: 2
  })

  useEffect(() => {
    loadComplianceData()
    const interval = setInterval(loadComplianceData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadComplianceData = async () => {
    try {
      const complianceRecords = await supabaseClient.getComplianceRecords()
      setRecords(complianceRecords)
      
      // Calculate metrics
      const pending = complianceRecords.filter(r => r.status === 'pending' || r.status === 'in_review').length
      const critical = complianceRecords.filter(r => r.priority === 'critical').length
      
      setComplianceMetrics({
        totalRecords: complianceRecords.length,
        pendingReviews: pending,
        complianceScore: Math.max(60, 100 - (critical * 10) - (pending * 2)),
        criticalIssues: critical
      })
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runComplianceAudit = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('compliance_audit', {
        type: 'full_audit',
        priority: 'high'
      })
      
      if (result.success) {
        console.log('Compliance audit initiated:', result.data)
        loadComplianceData() // Refresh data
      }
    } catch (error) {
      console.error('Failed to run compliance audit:', error)
    }
  }

  const generateComplianceReport = async () => {
    try {
      const result = await mcpRouter.executeWorkflow('generate_compliance_report', {
        period: 'monthly',
        includeRecommendations: true
      })
      
      if (result.success) {
        console.log('Compliance report generated:', result.data)
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error)
    }
  }

  const handleViewRecord = (record: ComplianceRecord) => {
    setSelectedRecord(record)
  }

  const handleDownloadReport = async (recordId: string) => {
    try {
      const result = await mcpRouter.executeWorkflow('download_compliance_report', {
        recordId,
        format: 'pdf',
        priority: 'medium'
      })
      
      if (result.success) {
        console.log('Compliance report download initiated:', result.data)
        // In a real implementation, this would trigger a file download
        const downloadUrl = result.data?.downloadUrl
        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
        }
      }
    } catch (error) {
      console.error('Failed to download compliance report:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-primary-500 font-orbitron">Loading Compliance Data...</p>
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
            COMPLIANCE OVERSIGHT
          </h1>
          <p className="section-subtitle">
            Karen Agent - Regulatory compliance and risk management
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={runComplianceAudit}
            className="neon-button px-6 py-3 rounded-lg font-medium"
          >
            RUN AUDIT
          </button>
          <button 
            onClick={generateComplianceReport}
            className="bg-blue-500/20 border border-blue-500 text-blue-400 px-6 py-3 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
          >
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="stats-grid">
        <KPIWidget
          title="Total Records"
          value={complianceMetrics.totalRecords}
          icon={<FileText className="w-5 h-5" />}
          color="primary"
        />
        <KPIWidget
          title="Pending Reviews"
          value={complianceMetrics.pendingReviews}
          trend={complianceMetrics.pendingReviews > 5 ? 'up' : 'stable'}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="warning"
        />
        <KPIWidget
          title="Compliance Score"
          value={complianceMetrics.complianceScore}
          format="percentage"
          trend="stable"
          icon={<Shield className="w-5 h-5" />}
          color={complianceMetrics.complianceScore >= 90 ? 'success' : 'warning'}
        />
        <KPIWidget
          title="Critical Issues"
          value={complianceMetrics.criticalIssues}
          trend={complianceMetrics.criticalIssues === 0 ? 'stable' : 'down'}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={complianceMetrics.criticalIssues === 0 ? 'success' : 'error'}
        />
      </div>

      {/* Agent Status */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          KAREN AGENT STATUS
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentStatusCard 
            agentId="compliance" 
            showDetails={true}
            onAction={(action) => console.log('Compliance agent action:', action)}
          />
          <div className="card-bg rounded-2xl p-6">
            <h3 className="font-orbitron text-lg font-semibold text-white mb-4">
              RECENT ACTIVITIES
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Completed regulatory check for Deal #1247</span>
                <span className="text-gray-500 ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Flagged disclosure issue in Deal #1245</span>
                <span className="text-gray-500 ml-auto">15 min ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Generated monthly compliance report</span>
                <span className="text-gray-500 ml-auto">1 hour ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Updated compliance procedures</span>
                <span className="text-gray-500 ml-auto">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Records Table */}
      <div>
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          COMPLIANCE RECORDS
        </h2>
        <ComplianceTable 
          records={records}
          onViewRecord={handleViewRecord}
          onDownloadReport={handleDownloadReport}
        />
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-bg rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-orbitron text-xl font-semibold text-white">
                COMPLIANCE RECORD DETAILS
              </h3>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Record ID</label>
                  <div className="text-white font-mono">{selectedRecord.id}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <div className="text-white capitalize">{selectedRecord.type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="text-white capitalize">{selectedRecord.status}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Priority</label>
                  <div className="text-white capitalize">{selectedRecord.priority}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Title</label>
                <div className="text-white">{selectedRecord.title}</div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <div className="text-gray-300">{selectedRecord.description}</div>
              </div>
              
              {selectedRecord.findings.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Findings</label>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    {selectedRecord.findings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedRecord.recommendations.length > 0 && (
                <div>
                  <label className="text-sm text-gray-400">Recommendations</label>
                  <ul className="text-gray-300 list-disc list-inside space-y-1">
                    {selectedRecord.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
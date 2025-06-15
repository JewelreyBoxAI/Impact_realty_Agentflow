export interface AgentStatus {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'error'
  lastActivity: string
  tasksCompleted: number
  successRate: number
}

export interface KPIData {
  openComplianceItems: number
  recruitingPipelineStages: number
  activeDeals: number
  investmentActivity: number
}

export interface ComplianceItem {
  id: string
  dealId: string
  type: string
  status: 'pending' | 'review' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  dueDate: string
  assignedTo: string
  documents: string[]
  lastUpdated: string
}

export interface Candidate {
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

export interface MCPRequest {
  agentId: string
  payload: Record<string, any>
}

export interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  executionId?: string
}

export interface AgentConfig {
  endpoint: string
  timeout: number
  retries: number
}

export interface VectorMemory {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  created_at: string
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: string
  input_data: any
  output_data?: any
  started_at: string
  completed_at?: string
}

export interface Deal {
  id: string
  type: string
  status: string
  description: string
  priority: string
  compliance_status: string
  due_date: string
  documents: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
} 
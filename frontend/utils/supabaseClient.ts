import { createClient } from '@supabase/supabase-js'

// Handle missing environment variables gracefully
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

interface AgentState {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'error'
  lastActivity: string
  tasksCompleted: number
  successRate: number
  config: Record<string, any>
}

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

interface VectorMemory {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  created_at: string
}

class SupabaseClient {
  private isConfigured: boolean

  constructor() {
    // Check if Supabase is properly configured
    this.isConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    )
  }

  // Agent State Management
  async getAgentState(agentName: string): Promise<AgentState | null> {
    if (!this.isConfigured) {
      return this.getMockAgentState(agentName)
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('name', agentName)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return this.getMockAgentState(agentName)
      }
      return data
    } catch (error) {
      console.error('Error getting agent state:', error)
      return this.getMockAgentState(agentName)
    }
  }

  async saveAgentState(agentName: string, state: Partial<AgentState>): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Mock: Saving agent state for', agentName)
      return true
    }

    try {
      const { error } = await supabase
        .from('agents')
        .upsert({
          name: agentName,
          ...state,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase error:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error saving agent state:', error)
      return false
    }
  }

  async getAgentStatuses(): Promise<AgentStatus[]> {
    if (!this.isConfigured) {
      return this.getMockAgentStatuses()
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')

      if (error) {
        console.error('Supabase error:', error)
        return this.getMockAgentStatuses()
      }

      if (!data || data.length === 0) {
        return this.getMockAgentStatuses()
      }

      return data.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        lastActivity: this.formatLastActivity(agent.updated_at),
        tasksCompleted: agent.config?.tasks_completed || 0,
        successRate: agent.config?.success_rate || 0
      }))
    } catch (error) {
      console.error('Error getting agent statuses:', error)
      return this.getMockAgentStatuses()
    }
  }

  // Vector Memory Operations
  async queryVectorMemory(queryEmbedding: number[], topK: number = 5): Promise<VectorMemory[]> {
    if (!this.isConfigured) {
      return []
    }

    try {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: topK
      })

      if (error) {
        console.error('Vector search error:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error querying vector memory:', error)
      return []
    }
  }

  async saveVectorMemory(content: string, embedding: number[], metadata: Record<string, any>): Promise<string | null> {
    if (!this.isConfigured) {
      console.log('Mock: Saving vector memory')
      return 'mock_id_' + Date.now()
    }

    try {
      const { data, error } = await supabase
        .from('vector_memory')
        .insert({
          content,
          embedding,
          metadata,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error saving vector memory:', error)
        return null
      }
      return data.id
    } catch (error) {
      console.error('Error saving vector memory:', error)
      return null
    }
  }

  // KPI Data
  async getKPIData(): Promise<KPIData> {
    if (!this.isConfigured) {
      return this.getMockKPIData()
    }

    try {
      const [compliance, recruiting, deals, investments] = await Promise.all([
        this.getComplianceItems(),
        this.getRecruitingPipeline(),
        this.getActiveDeals(),
        this.getInvestmentActivity()
      ])

      return {
        openComplianceItems: compliance,
        recruitingPipelineStages: recruiting,
        activeDeals: deals,
        investmentActivity: investments
      }
    } catch (error) {
      console.error('Error getting KPI data:', error)
      return this.getMockKPIData()
    }
  }

  private async getComplianceItems(): Promise<number> {
    if (!this.isConfigured) {
      return 12 // Mock fallback
    }

    try {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'compliant')

      if (error) {
        console.error('Error getting compliance items:', error)
        return 12 // Mock fallback
      }
      return count || 0
    } catch (error) {
      return 12 // Mock fallback
    }
  }

  private async getRecruitingPipeline(): Promise<number> {
    if (!this.isConfigured) {
      return 8 // Mock fallback
    }

    try {
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'screening', 'interview'])

      if (error) {
        console.error('Error getting recruiting pipeline:', error)
        return 8 // Mock fallback
      }
      return count || 0
    } catch (error) {
      return 8 // Mock fallback
    }
  }

  private async getActiveDeals(): Promise<number> {
    if (!this.isConfigured) {
      return 23 // Mock fallback
    }

    try {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (error) {
        console.error('Error getting active deals:', error)
        return 23 // Mock fallback
      }
      return count || 0
    } catch (error) {
      return 23 // Mock fallback
    }
  }

  private async getInvestmentActivity(): Promise<number> {
    if (!this.isConfigured) {
      return 5 // Mock fallback
    }

    try {
      const { count, error } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'investment')

      if (error) {
        console.error('Error getting investment activity:', error)
        return 5 // Mock fallback
      }
      return count || 0
    } catch (error) {
      return 5 // Mock fallback
    }
  }

  // Workflow Executions
  async logWorkflowExecution(workflowId: string, status: string, inputData: any, outputData?: any): Promise<void> {
    if (!this.isConfigured) {
      console.log('Mock: Logging workflow execution', workflowId, status)
      return
    }

    try {
      const { error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          status,
          input_data: inputData,
          output_data: outputData,
          started_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error logging workflow execution:', error)
      }
    } catch (error) {
      console.error('Error logging workflow execution:', error)
    }
  }

  async getWorkflowExecutions(limit: number = 50): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getMockWorkflowExecutions()
    }

    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error getting workflow executions:', error)
        return this.getMockWorkflowExecutions()
      }
      return data || []
    } catch (error) {
      console.error('Error getting workflow executions:', error)
      return this.getMockWorkflowExecutions()
    }
  }

  // Candidates
  async getCandidates(filters?: Record<string, any>): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getMockCandidates()
    }

    try {
      let query = supabase.from('candidates').select('*')

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting candidates:', error)
        return this.getMockCandidates()
      }
      return data || this.getMockCandidates()
    } catch (error) {
      console.error('Error getting candidates:', error)
      return this.getMockCandidates()
    }
  }

  async updateCandidateStatus(candidateId: string, status: string, notes?: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Mock: Updating candidate status', candidateId, status)
      return true
    }

    try {
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (notes) updateData.notes = notes

      const { error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', candidateId)

      if (error) {
        console.error('Error updating candidate status:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error updating candidate status:', error)
      return false
    }
  }

  // Deals
  async getDeals(filters?: Record<string, any>): Promise<any[]> {
    if (!this.isConfigured) {
      return this.getMockDeals()
    }

    try {
      let query = supabase.from('deals').select('*')

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting deals:', error)
        return this.getMockDeals()
      }
      return data || this.getMockDeals()
    } catch (error) {
      console.error('Error getting deals:', error)
      return this.getMockDeals()
    }
  }

  async updateDealStatus(dealId: string, status: string, metadata?: Record<string, any>): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('Mock: Updating deal status', dealId, status)
      return true
    }

    try {
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (metadata) updateData.metadata = metadata

      const { error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', dealId)

      if (error) {
        console.error('Error updating deal status:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error updating deal status:', error)
      return false
    }
  }

  // Mock Data Methods (for when Supabase is not available)
  private getMockAgentState(agentName: string): AgentState {
    return {
      id: `agent_${agentName}`,
      name: agentName,
      type: 'AI Agent',
      status: 'active',
      lastActivity: new Date().toISOString(),
      tasksCompleted: Math.floor(Math.random() * 100),
      successRate: Math.floor(Math.random() * 30) + 70,
      config: {}
    }
  }

  private getMockAgentStatuses(): AgentStatus[] {
    return [
      {
        id: 'supervisor_001',
        name: 'Supervisor',
        type: 'Orchestration Agent',
        status: 'active',
        lastActivity: '2 minutes ago',
        tasksCompleted: 127,
        successRate: 96
      },
      {
        id: 'compliance_001',
        name: 'Compliance',
        type: 'Validation Agent',
        status: 'active',
        lastActivity: '5 minutes ago',
        tasksCompleted: 89,
        successRate: 94
      },
      {
        id: 'recruiting_001',
        name: 'Recruiting',
        type: 'Sourcing Agent',
        status: 'active',
        lastActivity: '1 minute ago',
        tasksCompleted: 156,
        successRate: 87
      },
      {
        id: 'investments_001',
        name: 'Investments',
        type: 'Analysis Agent',
        status: 'idle',
        lastActivity: '15 minutes ago',
        tasksCompleted: 43,
        successRate: 92
      }
    ]
  }

  private getMockKPIData(): KPIData {
    return {
      openComplianceItems: 12,
      recruitingPipelineStages: 8,
      activeDeals: 23,
      investmentActivity: 5
    }
  }

  private getMockCandidates(): any[] {
    return [
      {
        id: 'cand_001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        status: 'new',
        score: 85,
        experience: '5 years residential sales',
        location: 'Miami, FL',
        notes: 'Strong background in luxury properties',
        created_at: new Date().toISOString()
      },
      {
        id: 'cand_002',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '(555) 234-5678',
        status: 'screening',
        score: 92,
        experience: '8 years commercial real estate',
        location: 'Orlando, FL',
        notes: 'Excellent track record with commercial deals',
        created_at: new Date().toISOString()
      },
      {
        id: 'cand_003',
        name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@email.com',
        phone: '(555) 345-6789',
        status: 'interview',
        score: 78,
        experience: '3 years property management',
        location: 'Tampa, FL',
        notes: 'Transitioning from property management to sales',
        created_at: new Date().toISOString()
      }
    ]
  }

  private getMockDeals(): any[] {
    return [
      {
        id: 'deal_001',
        type: 'residential',
        status: 'active',
        description: 'Single family home sale - 123 Main St',
        priority: 'medium',
        compliance_status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        documents: ['contract.pdf', 'disclosure.pdf'],
        metadata: { price: 450000, sqft: 2100 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'deal_002',
        type: 'commercial',
        status: 'active',
        description: 'Office building acquisition - Downtown Plaza',
        priority: 'high',
        compliance_status: 'approved',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        documents: ['purchase_agreement.pdf', 'inspection_report.pdf'],
        metadata: { price: 2500000, sqft: 15000 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  private getMockWorkflowExecutions(): any[] {
    return [
      {
        id: 'exec_001',
        workflow_id: 'compliance_scan',
        status: 'completed',
        input_data: { scope: 'all_active_deals' },
        output_data: { issues_found: 2, compliance_score: 94 },
        started_at: new Date().toISOString()
      }
    ]
  }

  // Utility functions
  private formatLastActivity(timestamp: string): string {
    const now = new Date()
    const activity = new Date(timestamp)
    const diffMs = now.getTime() - activity.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  // Real-time subscriptions
  subscribeToAgentUpdates(callback: (payload: any) => void) {
    if (!this.isConfigured) {
      console.log('Mock: Subscribing to agent updates')
      return { unsubscribe: () => {} }
    }

    return supabase
      .channel('agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, callback)
      .subscribe()
  }

  subscribeToWorkflowUpdates(callback: (payload: any) => void) {
    if (!this.isConfigured) {
      console.log('Mock: Subscribing to workflow updates')
      return { unsubscribe: () => {} }
    }

    return supabase
      .channel('workflow_executions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflow_executions' }, callback)
      .subscribe()
  }
}

export const supabaseClient = new SupabaseClient()

// Type exports
export type { AgentState, AgentStatus, KPIData, VectorMemory } 
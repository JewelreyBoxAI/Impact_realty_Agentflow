import { createClient } from '@supabase/supabase-js'
import { ComplianceRecord, Candidate, Investment, Deal, Client, SystemLog } from '@/types/database'
import { AgentStatus } from '@/types/agents'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

class SupabaseClient {
  private client: any
  private mockMode: boolean

  constructor() {
    this.mockMode = !supabaseUrl || !supabaseKey
    
    if (!this.mockMode) {
      this.client = createClient(supabaseUrl, supabaseKey)
    }
  }

  async getAgentStatuses(): Promise<AgentStatus[]> {
    if (this.mockMode) {
      return this.getMockAgentStatuses()
    }

    try {
      const { data, error } = await this.client
        .from('agent_statuses')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch agent statuses:', error)
      return this.getMockAgentStatuses()
    }
  }

  async getComplianceRecords(): Promise<ComplianceRecord[]> {
    if (this.mockMode) {
      return this.getMockComplianceRecords()
    }

    try {
      const { data, error } = await this.client
        .from('compliance_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch compliance records:', error)
      return this.getMockComplianceRecords()
    }
  }

  async getCandidates(): Promise<Candidate[]> {
    if (this.mockMode) {
      return this.getMockCandidates()
    }

    try {
      const { data, error } = await this.client
        .from('candidates')
        .select(`
          *,
          documents:candidate_documents(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch candidates:', error)
      return this.getMockCandidates()
    }
  }

  async getInvestments(): Promise<Investment[]> {
    if (this.mockMode) {
      return this.getMockInvestments()
    }

    try {
      const { data, error } = await this.client
        .from('investments')
        .select(`
          *,
          documents:investment_documents(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch investments:', error)
      return this.getMockInvestments()
    }
  }

  async getDeals(): Promise<Deal[]> {
    if (this.mockMode) {
      return this.getMockDeals()
    }

    try {
      const { data, error } = await this.client
        .from('deals')
        .select(`
          *,
          milestones:deal_milestones(*),
          documents:deal_documents(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch deals:', error)
      return this.getMockDeals()
    }
  }

  async getClients(): Promise<Client[]> {
    if (this.mockMode) {
      return this.getMockClients()
    }

    try {
      const { data, error } = await this.client
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      return this.getMockClients()
    }
  }

  async getSystemLogs(): Promise<SystemLog[]> {
    if (this.mockMode) {
      return this.getMockSystemLogs()
    }

    try {
      const { data, error } = await this.client
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch system logs:', error)
      return this.getMockSystemLogs()
    }
  }

  private getMockAgentStatuses(): AgentStatus[] {
    return [
      {
        agentId: 'supervisor',
        status: 'active',
        health: 'healthy',
        uptime: '99.8%',
        lastExecution: '2 minutes ago',
        queueSize: 3,
        performance: {
          tasksCompleted: 1247,
          successRate: 98.5,
          averageResponseTime: 1200,
          errorCount: 3
        },
        resources: {
          cpuUsage: 23,
          memoryUsage: 45,
          diskUsage: 12
        }
      },
      {
        agentId: 'compliance',
        status: 'active',
        health: 'healthy',
        uptime: '99.5%',
        lastExecution: '5 minutes ago',
        queueSize: 1,
        performance: {
          tasksCompleted: 892,
          successRate: 96.2,
          averageResponseTime: 3400,
          errorCount: 8
        },
        resources: {
          cpuUsage: 18,
          memoryUsage: 32,
          diskUsage: 8
        }
      }
    ]
  }

  private getMockComplianceRecords(): ComplianceRecord[] {
    return [
      {
        id: '1',
        dealId: 'deal_001',
        agentId: 'compliance',
        status: 'pending',
        priority: 'high',
        type: 'document_review',
        title: 'Purchase Agreement Review',
        description: 'Review purchase agreement for compliance issues',
        findings: [],
        recommendations: [],
        assignedTo: 'Karen',
        dueDate: '2024-01-20',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        metadata: {}
      }
    ]
  }

  private getMockCandidates(): Candidate[] {
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0123',
        status: 'interviewed',
        stage: 'interview',
        source: 'LinkedIn',
        experience: 5,
        skills: ['Real Estate', 'Sales', 'Customer Service'],
        location: 'New York, NY',
        expectedSalary: 75000,
        notes: 'Strong candidate with excellent communication skills',
        assignedRecruiter: 'Eileen',
        lastContact: '2024-01-15T14:30:00Z',
        nextFollowUp: '2024-01-18T10:00:00Z',
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        documents: []
      }
    ]
  }

  private getMockInvestments(): Investment[] {
    return [
      {
        id: '1',
        propertyId: 'prop_001',
        dealId: 'deal_001',
        type: 'acquisition',
        status: 'analyzing',
        investmentAmount: 500000,
        expectedROI: 12.5,
        riskLevel: 'medium',
        timeline: {
          startDate: '2024-01-15',
          expectedEndDate: '2024-06-15'
        },
        metrics: {
          irr: 12.5,
          npv: 125000,
          paybackPeriod: 8,
          cashFlow: [50000, 60000, 70000, 80000, 90000]
        },
        assignedAnalyst: 'Kevin',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        notes: 'Promising investment opportunity in growing market',
        documents: []
      }
    ]
  }

  private getMockDeals(): Deal[] {
    return [
      {
        id: '1',
        propertyId: 'prop_001',
        clientId: 'client_001',
        agentId: 'agent_001',
        type: 'buy',
        status: 'negotiating',
        offerAmount: 450000,
        commission: 13500,
        timeline: {
          listDate: '2024-01-10',
          offerDate: '2024-01-15'
        },
        milestones: [],
        documents: [],
        notes: 'First-time buyer, needs guidance through process',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T16:00:00Z'
      }
    ]
  }

  private getMockClients(): Client[] {
    return [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0456',
        type: 'buyer',
        status: 'active',
        preferences: {
          propertyTypes: ['residential'],
          priceRange: { min: 300000, max: 500000 },
          locations: ['Downtown', 'Suburbs'],
          features: ['3+ bedrooms', 'garage', 'yard']
        },
        assignedAgent: 'agent_001',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        notes: 'Looking for family home, flexible on timeline'
      }
    ]
  }

  private getMockSystemLogs(): SystemLog[] {
    return [
      {
        id: '1',
        level: 'info',
        source: 'supervisor-agent',
        message: 'Agent supervisor initialized successfully',
        timestamp: new Date().toISOString(),
        metadata: { version: '1.0.0', startup_time: '2.3s' }
      },
      {
        id: '2',
        level: 'warn',
        source: 'database',
        message: 'Connection pool approaching maximum capacity',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        metadata: { pool_size: 18, max_size: 20 }
      },
      {
        id: '3',
        level: 'error',
        source: 'api-gateway',
        message: 'Rate limit exceeded for client 192.168.1.100',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        metadata: { client_ip: '192.168.1.100', requests_per_minute: 150 }
      },
      {
        id: '4',
        level: 'info',
        source: 'compliance-agent',
        message: 'Compliance check completed for deal #1247',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        metadata: { deal_id: '1247', status: 'passed' }
      },
      {
        id: '5',
        level: 'debug',
        source: 'mcp-router',
        message: 'MCP protocol message processed',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        metadata: { message_type: 'workflow_execution', agent: 'recruiting' }
      }
    ]
  }
}

export const supabaseClient = new SupabaseClient() 
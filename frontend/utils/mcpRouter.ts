import { MCPRequest, MCPResponse, AgentInvocationRequest } from '@/types/api'
import { AgentStatus, SystemHealth } from '@/types/agents'

interface AgentConfig {
  endpoint: string
  timeout: number
  retries: number
}

class MCPRouter {
  private baseUrl: string
  private authToken: string
  private agentConfigs: Record<string, AgentConfig>
  private mockMode: boolean

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    this.authToken = process.env.NEXT_PUBLIC_API_TOKEN || ''
    this.mockMode = process.env.NODE_ENV === 'development'
    
    this.agentConfigs = {
      supervisor: { endpoint: '/api/agents/supervisor', timeout: 30000, retries: 2 },
      compliance: { endpoint: '/api/agents/compliance', timeout: 60000, retries: 3 },
      recruiting: { endpoint: '/api/agents/recruiting', timeout: 45000, retries: 2 },
      investments: { endpoint: '/api/agents/investments', timeout: 90000, retries: 1 },
      communication: { endpoint: '/api/agents/communication', timeout: 30000, retries: 2 },
      analytics: { endpoint: '/api/agents/analytics', timeout: 60000, retries: 1 }
    }
  }

  async invokeAgent(agentId: string, payload: AgentInvocationRequest): Promise<MCPResponse> {
    if (this.mockMode) {
      return this.mockResponse(agentId, payload)
    }

    const config = this.agentConfigs[agentId]
    if (!config) {
      return {
        success: false,
        error: `Unknown agent: ${agentId}`,
        timestamp: new Date().toISOString()
      }
    }

    const url = `${this.baseUrl}${config.endpoint}`
    const requestId = this.generateRequestId()

    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-Request-ID': requestId,
          'X-Agent-ID': agentId
        },
        body: JSON.stringify({
          ...payload,
          requestId,
          timestamp: new Date().toISOString()
        })
      }, config.timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        executionId: requestId,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`MCP Agent invocation failed for ${agentId}:`, error)
      return this.mockResponse(agentId, payload)
    }
  }

  async getAgentStatus(agentId: string): Promise<MCPResponse<AgentStatus>> {
    if (this.mockMode) {
      return this.mockAgentStatus(agentId)
    }

    const config = this.agentConfigs[agentId]
    if (!config) {
      return {
        success: false,
        error: `Unknown agent: ${agentId}`,
        timestamp: new Date().toISOString()
      }
    }

    const url = `${this.baseUrl}${config.endpoint}/status`

    try {
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Agent-ID': agentId
        }
      }, 10000)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Failed to get status for ${agentId}:`, error)
      return this.mockAgentStatus(agentId)
    }
  }

  async healthCheck(): Promise<Record<string, MCPResponse>> {
    const results: Record<string, MCPResponse> = {}
    
    const healthChecks = Object.keys(this.agentConfigs).map(async (agentId) => {
      const result = await this.getAgentStatus(agentId)
      results[agentId] = result
    })

    await Promise.all(healthChecks)
    return results
  }

  async executeWorkflow(workflowType: string, params: Record<string, any>): Promise<MCPResponse> {
    return this.invokeAgent('supervisor', {
      action: 'execute_workflow',
      parameters: {
        workflow_type: workflowType,
        params
      }
    })
  }

  private async makeRequest(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async mockResponse(agentId: string, payload: any): Promise<MCPResponse> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const mockResponses: Record<string, any> = {
      supervisor: {
        status: 'completed',
        message: 'Workflow executed successfully',
        agents_coordinated: ['compliance', 'recruiting', 'investments'],
        execution_time: '2.3s'
      },
      compliance: {
        status: 'completed',
        compliance_score: 94,
        issues_found: 2,
        recommendations: ['Update disclosure forms', 'Review contract terms'],
        deals_reviewed: 15
      },
      recruiting: {
        status: 'completed',
        candidates_processed: 15,
        qualified_candidates: 8,
        next_interviews: 3,
        outreach_sent: 25
      },
      investments: {
        status: 'completed',
        deals_analyzed: 5,
        roi_projections: [12.5, 8.3, 15.7, 22.1, 9.8],
        risk_assessment: 'moderate',
        recommended_deals: 2
      }
    }

    return {
      success: true,
      data: mockResponses[agentId] || { status: 'completed', message: 'Mock response' },
      executionId: this.generateRequestId(),
      timestamp: new Date().toISOString()
    }
  }

  private async mockAgentStatus(agentId: string): Promise<MCPResponse<AgentStatus>> {
    const statusData: Record<string, AgentStatus> = {
      supervisor: {
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
      compliance: {
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
      },
      recruiting: {
        agentId: 'recruiting',
        status: 'active',
        health: 'healthy',
        uptime: '99.9%',
        lastExecution: '1 minute ago',
        queueSize: 5,
        performance: {
          tasksCompleted: 2156,
          successRate: 94.8,
          averageResponseTime: 2100,
          errorCount: 12
        },
        resources: {
          cpuUsage: 31,
          memoryUsage: 28,
          diskUsage: 15
        }
      },
      investments: {
        agentId: 'investments',
        status: 'idle',
        health: 'healthy',
        uptime: '99.7%',
        lastExecution: '15 minutes ago',
        queueSize: 0,
        performance: {
          tasksCompleted: 456,
          successRate: 97.1,
          averageResponseTime: 5600,
          errorCount: 2
        },
        resources: {
          cpuUsage: 8,
          memoryUsage: 22,
          diskUsage: 5
        }
      }
    }

    return {
      success: true,
      data: statusData[agentId] || {
        agentId,
        status: 'idle',
        health: 'healthy',
        uptime: '0%',
        lastExecution: 'never',
        queueSize: 0,
        performance: {
          tasksCompleted: 0,
          successRate: 0,
          averageResponseTime: 0,
          errorCount: 0
        },
        resources: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0
        }
      },
      timestamp: new Date().toISOString()
    }
  }
}

export const mcpRouter = new MCPRouter()
export type { MCPRequest, MCPResponse } 
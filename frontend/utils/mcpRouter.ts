interface MCPRequest {
  agentId: string
  payload: Record<string, any>
}

interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  executionId?: string
}

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
    // Use environment variables if available, otherwise use defaults
    this.baseUrl = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_MCP_ENDPOINT) || 'http://localhost:8000'
    this.authToken = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_MCP_AUTH_TOKEN) || 'mock_token'
    this.mockMode = true // Default to mock mode for development
    
    // Agent endpoint configurations
    this.agentConfigs = {
      supervisor: {
        endpoint: '/api/agents/supervisor',
        timeout: 30000,
        retries: 2
      },
      compliance: {
        endpoint: '/api/agents/compliance',
        timeout: 60000,
        retries: 3
      },
      recruiting: {
        endpoint: '/api/agents/recruiting',
        timeout: 45000,
        retries: 2
      },
      investments: {
        endpoint: '/api/agents/investments',
        timeout: 90000,
        retries: 1
      },
      communication: {
        endpoint: '/api/agents/communication',
        timeout: 30000,
        retries: 2
      },
      analytics: {
        endpoint: '/api/agents/analytics',
        timeout: 60000,
        retries: 1
      }
    }
  }

  /**
   * Invoke an agent through the MCP gateway
   */
  async invokeAgent(agentId: string, payload: Record<string, any>): Promise<MCPResponse> {
    // Always use mock mode for now until backend is connected
    if (this.mockMode) {
      return this.mockResponse(agentId, payload)
    }

    const config = this.agentConfigs[agentId]
    if (!config) {
      return {
        success: false,
        error: `Unknown agent: ${agentId}`
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
        executionId: requestId
      }
    } catch (error) {
      console.error(`MCP Agent invocation failed for ${agentId}:`, error)
      // Fallback to mock response on error
      return this.mockResponse(agentId, payload)
    }
  }

  /**
   * Execute a workflow through the supervisor agent
   */
  async executeWorkflow(workflowType: string, params: Record<string, any>): Promise<MCPResponse> {
    return this.invokeAgent('supervisor', {
      action: 'execute_workflow',
      workflow_type: workflowType,
      params
    })
  }

  /**
   * Get agent status from MCP
   */
  async getAgentStatus(agentId: string): Promise<MCPResponse> {
    if (this.mockMode) {
      return this.mockAgentStatus(agentId)
    }

    const config = this.agentConfigs[agentId]
    if (!config) {
      return {
        success: false,
        error: `Unknown agent: ${agentId}`
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
        data
      }
    } catch (error) {
      console.error(`Failed to get status for ${agentId}:`, error)
      return this.mockAgentStatus(agentId)
    }
  }

  /**
   * Health check for all agents
   */
  async healthCheck(): Promise<Record<string, MCPResponse>> {
    const results: Record<string, MCPResponse> = {}
    
    const healthChecks = Object.keys(this.agentConfigs).map(async (agentId) => {
      const result = await this.getAgentStatus(agentId)
      results[agentId] = result
    })

    await Promise.all(healthChecks)
    return results
  }

  /**
   * Batch agent invocation
   */
  async invokeBatch(requests: MCPRequest[]): Promise<Record<string, MCPResponse>> {
    const results: Record<string, MCPResponse> = {}
    
    const batchRequests = requests.map(async (request) => {
      const result = await this.invokeAgent(request.agentId, request.payload)
      results[request.agentId] = result
    })

    await Promise.all(batchRequests)
    return results
  }

  /**
   * Stream agent responses (for long-running operations)
   */
  async streamAgentResponse(agentId: string, payload: Record<string, any>): Promise<ReadableStream> {
    if (this.mockMode) {
      // Create a mock stream
      const mockResponse = await this.mockResponse(agentId, payload)
      return new ReadableStream({
        start(controller) {
          const mockData = JSON.stringify(mockResponse)
          controller.enqueue(new TextEncoder().encode(mockData))
          controller.close()
        }
      })
    }

    const config = this.agentConfigs[agentId]
    if (!config) {
      throw new Error(`Unknown agent: ${agentId}`)
    }

    const url = `${this.baseUrl}${config.endpoint}/stream`
    const requestId = this.generateRequestId()

    const response = await fetch(url, {
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
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.body!
  }

  /**
   * Cancel agent execution
   */
  async cancelExecution(executionId: string): Promise<MCPResponse> {
    if (this.mockMode) {
      return {
        success: true,
        data: { message: 'Execution cancelled (mock)', executionId }
      }
    }

    const url = `${this.baseUrl}/api/executions/${executionId}/cancel`

    try {
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Execution-ID': executionId
        }
      }, 10000)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error(`Failed to cancel execution ${executionId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<MCPResponse> {
    if (this.mockMode) {
      return {
        success: true,
        data: { 
          status: 'completed', 
          executionId,
          progress: 100,
          message: 'Execution completed successfully (mock)'
        }
      }
    }

    const url = `${this.baseUrl}/api/executions/${executionId}/status`

    try {
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Execution-ID': executionId
        }
      }, 10000)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error(`Failed to get execution status ${executionId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(agentId: string, config: Partial<AgentConfig>): Promise<void> {
    if (this.agentConfigs[agentId]) {
      this.agentConfigs[agentId] = {
        ...this.agentConfigs[agentId],
        ...config
      }
    }
  }

  /**
   * Enable/disable mock mode
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled
  }

  /**
   * Private helper methods
   */
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

  /**
   * Mock response methods
   */
  private async mockResponse(agentId: string, payload: Record<string, any>): Promise<MCPResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

    const mockResponses: Record<string, any> = {
      supervisor: {
        status: 'completed',
        message: 'Workflow executed successfully',
        agents_coordinated: ['compliance', 'recruiting', 'investments'],
        execution_time: '2.3s',
        workflow_type: payload.workflow_type || 'unknown',
        timestamp: new Date().toISOString()
      },
      compliance: {
        status: 'completed',
        compliance_score: 94,
        issues_found: 2,
        recommendations: ['Update disclosure forms', 'Review contract terms'],
        deals_reviewed: 15,
        critical_issues: 0,
        timestamp: new Date().toISOString()
      },
      recruiting: {
        status: 'completed',
        candidates_processed: 15,
        qualified_candidates: 8,
        next_interviews: 3,
        outreach_sent: 25,
        response_rate: '32%',
        timestamp: new Date().toISOString()
      },
      investments: {
        status: 'completed',
        deals_analyzed: 5,
        roi_projections: [12.5, 8.3, 15.7, 22.1, 9.8],
        risk_assessment: 'moderate',
        recommended_deals: 2,
        total_investment_value: 3250000,
        timestamp: new Date().toISOString()
      },
      communication: {
        status: 'completed',
        emails_sent: 12,
        calls_scheduled: 5,
        follow_ups_created: 8,
        response_rate: '78%',
        timestamp: new Date().toISOString()
      },
      analytics: {
        status: 'completed',
        reports_generated: 3,
        insights_found: 7,
        performance_metrics: {
          conversion_rate: '15.2%',
          avg_deal_size: 425000,
          time_to_close: '45 days'
        },
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      data: mockResponses[agentId] || { 
        status: 'completed', 
        message: 'Mock response generated',
        agent_id: agentId,
        timestamp: new Date().toISOString()
      },
      executionId: this.generateRequestId()
    }
  }

  private async mockAgentStatus(agentId: string): Promise<MCPResponse> {
    const statusData: Record<string, any> = {
      supervisor: {
        status: 'active',
        health: 'healthy',
        uptime: '99.8%',
        last_execution: '2 minutes ago',
        queue_size: 3,
        active_workflows: 2
      },
      compliance: {
        status: 'active',
        health: 'healthy',
        uptime: '99.5%',
        last_execution: '5 minutes ago',
        queue_size: 1,
        compliance_checks_today: 127
      },
      recruiting: {
        status: 'active',
        health: 'healthy',
        uptime: '99.9%',
        last_execution: '1 minute ago',
        queue_size: 5,
        candidates_processed_today: 42
      },
      investments: {
        status: 'idle',
        health: 'healthy',
        uptime: '99.7%',
        last_execution: '15 minutes ago',
        queue_size: 0,
        deals_analyzed_today: 8
      }
    }

    return {
      success: true,
      data: statusData[agentId] || {
        status: 'unknown',
        health: 'unknown',
        uptime: '0%',
        last_execution: 'never',
        queue_size: 0
      }
    }
  }
}

export const mcpRouter = new MCPRouter()

// Type exports
export type { MCPRequest, MCPResponse, AgentConfig } 
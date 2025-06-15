export interface Agent {
  id: string
  name: string
  type: 'supervisor' | 'compliance' | 'recruiting' | 'investments' | 'communication' | 'analytics'
  status: 'active' | 'idle' | 'error' | 'maintenance'
  health: 'healthy' | 'warning' | 'error'
  uptime: string
  lastActivity: string
  tasksCompleted: number
  successRate: number
  queueSize: number
  capabilities: string[]
  metadata: Record<string, any>
}

export interface AgentStatus {
  agentId: string
  status: 'active' | 'idle' | 'error' | 'maintenance'
  health: 'healthy' | 'warning' | 'error'
  uptime: string
  lastExecution: string
  queueSize: number
  currentTask?: string
  performance: {
    tasksCompleted: number
    successRate: number
    averageResponseTime: number
    errorCount: number
  }
  resources: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
  }
}

export interface WorkflowExecution {
  id: string
  workflowType: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number
  agentsInvolved: string[]
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
  progress: number
  steps: WorkflowStep[]
}

export interface WorkflowStep {
  id: string
  name: string
  agentId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: string
  endTime?: string
  input: Record<string, any>
  output?: Record<string, any>
  error?: string
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error'
  database: 'healthy' | 'warning' | 'error'
  agents: 'healthy' | 'warning' | 'error'
  mcp: 'healthy' | 'warning' | 'error'
  integrations: 'healthy' | 'warning' | 'error'
  lastCheck: string
  uptime: string
  version: string
}

export interface AgentMetrics {
  agentId: string
  timestamp: string
  metrics: {
    responseTime: number
    throughput: number
    errorRate: number
    cpuUsage: number
    memoryUsage: number
    queueDepth: number
    activeConnections: number
  }
}

export interface AgentLog {
  id: string
  agentId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  metadata?: Record<string, any>
  executionId?: string
  workflowId?: string
}

export interface AgentCapability {
  name: string
  description: string
  parameters: CapabilityParameter[]
  returnType: string
}

export interface CapabilityParameter {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: any
}

export interface AgentConfiguration {
  agentId: string
  config: {
    maxConcurrentTasks: number
    timeout: number
    retryAttempts: number
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    enableMetrics: boolean
    customSettings: Record<string, any>
  }
} 
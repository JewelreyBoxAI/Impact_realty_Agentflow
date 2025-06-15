export interface MCPRequest {
  agentId: string
  payload: Record<string, any>
  requestId?: string
  timestamp?: string
}

export interface MCPResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  executionId?: string
  timestamp: string
  duration?: number
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'error'
  services: {
    database: ServiceHealth
    agents: ServiceHealth
    mcp: ServiceHealth
    integrations: ServiceHealth
  }
  uptime: string
  version: string
  timestamp: string
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'error'
  responseTime: number
  lastCheck: string
  details?: Record<string, any>
}

export interface AgentInvocationRequest {
  action: string
  parameters?: Record<string, any>
  timeout?: number
  priority?: 'low' | 'normal' | 'high'
}

export interface AgentInvocationResponse {
  executionId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  startTime: string
  endTime?: string
  duration?: number
}

export interface WorkflowExecutionRequest {
  workflowType: string
  parameters: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
  timeout?: number
}

export interface WorkflowExecutionResponse {
  workflowId: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  steps: WorkflowStepStatus[]
  result?: any
  error?: string
  startTime: string
  endTime?: string
  duration?: number
}

export interface WorkflowStepStatus {
  stepId: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  agentId: string
  startTime?: string
  endTime?: string
  result?: any
  error?: string
}

export interface MetricsQuery {
  agentIds?: string[]
  startTime: string
  endTime: string
  metrics: string[]
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count'
  interval?: string
}

export interface MetricsResponse {
  metrics: MetricData[]
  query: MetricsQuery
  timestamp: string
}

export interface MetricData {
  agentId: string
  metric: string
  values: MetricValue[]
  aggregation?: {
    avg?: number
    sum?: number
    min?: number
    max?: number
    count?: number
  }
}

export interface MetricValue {
  timestamp: string
  value: number
}

export interface LogQuery {
  agentIds?: string[]
  levels?: ('debug' | 'info' | 'warn' | 'error')[]
  startTime?: string
  endTime?: string
  search?: string
  limit?: number
  offset?: number
}

export interface LogResponse {
  logs: LogEntry[]
  total: number
  query: LogQuery
  timestamp: string
}

export interface LogEntry {
  id: string
  agentId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  metadata?: Record<string, any>
  executionId?: string
  workflowId?: string
}

export interface ConfigurationUpdate {
  agentId: string
  config: Record<string, any>
  validateOnly?: boolean
}

export interface ConfigurationResponse {
  success: boolean
  config: Record<string, any>
  validation?: ValidationResult[]
  appliedAt?: string
}

export interface ValidationResult {
  field: string
  valid: boolean
  message?: string
}

export interface SystemStatusResponse {
  overall: 'healthy' | 'warning' | 'error'
  components: {
    database: ComponentStatus
    agents: ComponentStatus
    mcp: ComponentStatus
    integrations: ComponentStatus
  }
  metrics: {
    totalRequests: number
    successRate: number
    averageResponseTime: number
    activeConnections: number
  }
  uptime: string
  version: string
  timestamp: string
}

export interface ComponentStatus {
  status: 'healthy' | 'warning' | 'error'
  message?: string
  lastCheck: string
  metrics?: Record<string, number>
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: string
    requestId?: string
  }
}

export interface BatchRequest<T = any> {
  requests: T[]
  options?: {
    parallel?: boolean
    failFast?: boolean
    timeout?: number
  }
}

export interface BatchResponse<T = any> {
  results: BatchResult<T>[]
  summary: {
    total: number
    successful: number
    failed: number
    duration: number
  }
  timestamp: string
}

export interface BatchResult<T = any> {
  index: number
  success: boolean
  data?: T
  error?: string
  duration: number
} 
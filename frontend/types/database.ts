export interface ComplianceRecord {
  id: string
  dealId: string
  agentId: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_action'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'document_review' | 'regulatory_check' | 'audit' | 'disclosure_review'
  title: string
  description: string
  findings: string[]
  recommendations: string[]
  assignedTo: string
  dueDate: string
  completedDate?: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: 'lead' | 'contacted' | 'interviewed' | 'offer_made' | 'hired' | 'rejected'
  stage: 'prospecting' | 'qualification' | 'interview' | 'negotiation' | 'onboarding'
  source: string
  experience: number
  skills: string[]
  location: string
  expectedSalary?: number
  notes: string
  assignedRecruiter: string
  lastContact: string
  nextFollowUp?: string
  createdAt: string
  updatedAt: string
  documents: CandidateDocument[]
}

export interface CandidateDocument {
  id: string
  candidateId: string
  type: 'resume' | 'cover_letter' | 'portfolio' | 'reference' | 'certification'
  fileName: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
}

export interface Investment {
  id: string
  propertyId: string
  dealId: string
  type: 'acquisition' | 'development' | 'renovation' | 'sale'
  status: 'analyzing' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  investmentAmount: number
  expectedROI: number
  actualROI?: number
  riskLevel: 'low' | 'medium' | 'high'
  timeline: {
    startDate: string
    expectedEndDate: string
    actualEndDate?: string
  }
  metrics: {
    irr: number
    npv: number
    paybackPeriod: number
    cashFlow: number[]
  }
  assignedAnalyst: string
  createdAt: string
  updatedAt: string
  notes: string
  documents: InvestmentDocument[]
}

export interface InvestmentDocument {
  id: string
  investmentId: string
  type: 'financial_model' | 'market_analysis' | 'due_diligence' | 'contract' | 'report'
  fileName: string
  fileUrl: string
  uploadedAt: string
  uploadedBy: string
}

export interface Property {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  propertyType: 'residential' | 'commercial' | 'industrial' | 'land'
  squareFootage: number
  bedrooms?: number
  bathrooms?: number
  yearBuilt: number
  listPrice: number
  marketValue: number
  status: 'available' | 'under_contract' | 'sold' | 'off_market'
  features: string[]
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  propertyId: string
  clientId: string
  agentId: string
  type: 'buy' | 'sell' | 'lease'
  status: 'prospecting' | 'negotiating' | 'under_contract' | 'closing' | 'closed' | 'cancelled'
  offerAmount: number
  finalAmount?: number
  commission: number
  timeline: {
    listDate?: string
    offerDate?: string
    contractDate?: string
    closingDate?: string
  }
  milestones: DealMilestone[]
  documents: DealDocument[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface DealMilestone {
  id: string
  dealId: string
  name: string
  status: 'pending' | 'completed' | 'overdue'
  dueDate: string
  completedDate?: string
  assignedTo: string
  notes: string
}

export interface DealDocument {
  id: string
  dealId: string
  type: 'contract' | 'disclosure' | 'inspection' | 'appraisal' | 'financing' | 'closing'
  fileName: string
  fileUrl: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  uploadedAt: string
  uploadedBy: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  type: 'buyer' | 'seller' | 'investor' | 'tenant' | 'landlord'
  status: 'active' | 'inactive' | 'prospect'
  preferences: {
    propertyTypes: string[]
    priceRange: {
      min: number
      max: number
    }
    locations: string[]
    features: string[]
  }
  assignedAgent: string
  createdAt: string
  updatedAt: string
  notes: string
}

export interface SystemLog {
  id: string
  level: 'debug' | 'info' | 'warn' | 'error'
  source: string
  message: string
  timestamp: string
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
}

export interface UserSession {
  id: string
  userId: string
  startTime: string
  endTime?: string
  ipAddress: string
  userAgent: string
  actions: SessionAction[]
}

export interface SessionAction {
  id: string
  sessionId: string
  action: string
  resource: string
  timestamp: string
  metadata?: Record<string, any>
} 
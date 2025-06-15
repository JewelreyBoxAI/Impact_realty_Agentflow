"""
Configuration settings for Impact Realty AI backend
"""

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional
import os
from datetime import datetime
import pytz


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Impact Realty AI"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1"],
        env="ALLOWED_HOSTS"
    )
    
    # Supabase Configuration
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., env="SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")
    
    # LLM Configuration
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    DEFAULT_LLM_MODEL: str = Field(default="gpt-4-turbo-preview", env="DEFAULT_LLM_MODEL")
    LLM_TEMPERATURE: float = Field(default=0.7, env="LLM_TEMPERATURE")
    MAX_TOKENS: int = Field(default=4096, env="MAX_TOKENS")
    
    # Zoho Integration
    ZOHO_CLIENT_ID: Optional[str] = Field(None, env="ZOHO_CLIENT_ID")
    ZOHO_CLIENT_SECRET: Optional[str] = Field(None, env="ZOHO_CLIENT_SECRET")
    ZOHO_REFRESH_TOKEN: Optional[str] = Field(None, env="ZOHO_REFRESH_TOKEN")
    
    # Broker Sumo Integration
    BROKER_SUMO_API_KEY: Optional[str] = Field(None, env="BROKER_SUMO_API_KEY")
    BROKER_SUMO_BASE_URL: str = Field(
        default="https://api.brokersumo.com/v1",
        env="BROKER_SUMO_BASE_URL"
    )
    
    # Google Workspace
    GOOGLE_CLIENT_ID: Optional[str] = Field(None, env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(None, env="GOOGLE_CLIENT_SECRET")
    GOOGLE_CREDENTIALS_PATH: Optional[str] = Field(None, env="GOOGLE_CREDENTIALS_PATH")
    
    # Mock Mode Configuration
    MOCK_MODE: bool = Field(default=False, env="MOCK_MODE")
    MOCK_RESPONSE_DELAY: float = Field(default=1.0, env="MOCK_RESPONSE_DELAY")
    
    # Agent Configuration
    AGENT_TIMEOUT: int = Field(default=300, env="AGENT_TIMEOUT")  # 5 minutes
    MAX_AGENT_RETRIES: int = Field(default=3, env="MAX_AGENT_RETRIES")
    AGENT_MEMORY_SIZE: int = Field(default=10, env="AGENT_MEMORY_SIZE")
    
    # Workflow Configuration
    WORKFLOW_TIMEOUT: int = Field(default=1800, env="WORKFLOW_TIMEOUT")  # 30 minutes
    MAX_WORKFLOW_STEPS: int = Field(default=50, env="MAX_WORKFLOW_STEPS")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")  # seconds
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    SENTRY_DSN: Optional[str] = Field(None, env="SENTRY_DSN")
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("ALLOWED_HOSTS", pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.now(pytz.UTC).isoformat()
    
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    def is_mock_mode(self) -> bool:
        """Check if mock mode is enabled"""
        return self.MOCK_MODE
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


# Agent-specific configurations
class AgentConfig:
    """Configuration for individual agents"""
    
    RECRUITING_AGENT = {
        "name": "recruiting_agent",
        "description": "Handles candidate sourcing, qualification, and engagement",
        "system_prompt": """You are a recruiting agent for Impact Realty AI. Your role is to:
1. Source and qualify real estate agent candidates
2. Engage with potential candidates through various channels
3. Screen candidates based on predefined criteria
4. Schedule interviews and follow-ups
5. Maintain candidate pipeline and status updates

Always be professional, informative, and helpful. Focus on finding quality candidates who fit the company culture and requirements.""",
        "tools": ["zoho_crm", "email", "calendar", "linkedin"],
        "max_iterations": 10,
        "temperature": 0.7
    }
    
    COMPLIANCE_AGENT = {
        "name": "compliance_agent",
        "description": "Manages document validation and regulatory compliance",
        "system_prompt": """You are a compliance agent for Impact Realty AI. Your responsibilities include:
1. Validating real estate documents and contracts
2. Ensuring compliance with Florida Real Estate Commission (FREC) regulations
3. Checking Equal Housing Opportunity requirements
4. Managing document workflows and approvals
5. Generating compliance reports and alerts

Always prioritize accuracy and regulatory compliance. Flag any potential issues immediately.""",
        "tools": ["document_analyzer", "zoho_crm", "compliance_checker"],
        "max_iterations": 5,
        "temperature": 0.3
    }
    
    DEAL_MANAGEMENT_AGENT = {
        "name": "deal_management_agent",
        "description": "Orchestrates transaction workflows and deal management",
        "system_prompt": """You are a deal management agent for Impact Realty AI. Your role encompasses:
1. Managing real estate transaction workflows
2. Tracking deal milestones and deadlines
3. Coordinating between buyers, sellers, and agents
4. Managing contract execution and documentation
5. Providing deal status updates and reporting

Focus on efficiency, accuracy, and timely execution of all deal-related tasks.""",
        "tools": ["zoho_crm", "broker_sumo", "document_manager", "calendar"],
        "max_iterations": 15,
        "temperature": 0.5
    }
    
    COMMUNICATION_AGENT = {
        "name": "communication_agent",
        "description": "Handles email, calendar, and CRM communications",
        "system_prompt": """You are a communication agent for Impact Realty AI. Your responsibilities include:
1. Managing email communications with clients and agents
2. Scheduling and coordinating calendar events
3. Updating CRM records with communication history
4. Sending automated follow-ups and reminders
5. Maintaining professional communication standards

Always maintain a professional, friendly, and helpful tone in all communications.""",
        "tools": ["gmail", "google_calendar", "zoho_crm", "email_templates"],
        "max_iterations": 8,
        "temperature": 0.6
    }
    
    ANALYTICS_AGENT = {
        "name": "analytics_agent",
        "description": "Provides performance metrics and business insights",
        "system_prompt": """You are an analytics agent for Impact Realty AI. Your role includes:
1. Analyzing business performance metrics
2. Generating reports and dashboards
3. Identifying trends and opportunities
4. Providing data-driven insights and recommendations
5. Monitoring KPIs and goal progress

Focus on accuracy, clarity, and actionable insights in all analysis and reporting.""",
        "tools": ["supabase", "zoho_crm", "report_generator", "data_analyzer"],
        "max_iterations": 12,
        "temperature": 0.4
    }


# MCP Configuration
class MCPConfig:
    """Model Context Protocol configurations"""
    
    ZOHO_MCP = {
        "name": "zoho_crm",
        "type": "crm",
        "base_url": "https://www.zohoapis.com/crm/v3",
        "authentication": "oauth2",
        "tools": [
            "get_contacts",
            "create_contact",
            "update_contact",
            "get_deals",
            "create_deal",
            "update_deal",
            "get_leads",
            "create_lead",
            "search_records"
        ]
    }
    
    BROKER_SUMO_MCP = {
        "name": "broker_sumo",
        "type": "mls",
        "base_url": "https://api.brokersumo.com/v1",
        "authentication": "api_key",
        "tools": [
            "search_properties",
            "get_property_details",
            "get_market_analytics",
            "get_comparables",
            "get_area_statistics"
        ]
    }
    
    GOOGLE_WORKSPACE_MCP = {
        "name": "google_workspace",
        "type": "productivity",
        "authentication": "oauth2",
        "tools": [
            "send_email",
            "create_calendar_event",
            "get_calendar_events",
            "create_document",
            "share_document"
        ]
    } 
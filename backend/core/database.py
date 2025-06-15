"""
Database connection and initialization for Supabase
"""

import asyncio
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import json

from .config import settings

logger = logging.getLogger(__name__)

# Global Supabase client
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    global _supabase_client
    
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
    
    return _supabase_client


def get_service_role_client() -> Client:
    """Get Supabase service role client for admin operations"""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )


async def init_db():
    """Initialize database schema and tables"""
    try:
        supabase = get_service_role_client()
        logger.info("Initializing database schema...")
        
        # Create tables if they don't exist
        await create_tables(supabase)
        
        # Create initial data
        await create_initial_data(supabase)
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


async def create_tables(supabase: Client):
    """Create necessary database tables"""
    
    # Users table (extends Supabase auth.users)
    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        company_id UUID,
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Companies table
    companies_table = """
    CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100) DEFAULT 'real_estate',
        settings JSONB DEFAULT '{}',
        subscription_plan VARCHAR(50) DEFAULT 'basic',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Agents table
    agents_table = """
    CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        system_prompt TEXT,
        config JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        company_id UUID REFERENCES companies(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Workflows table
    workflows_table = """
    CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100) NOT NULL,
        config JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        company_id UUID REFERENCES companies(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Workflow executions table
    workflow_executions_table = """
    CREATE TABLE IF NOT EXISTS workflow_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflows(id),
        status VARCHAR(50) DEFAULT 'running',
        input_data JSONB,
        output_data JSONB,
        steps JSONB DEFAULT '[]',
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        executed_by UUID REFERENCES users(id)
    );
    """
    
    # Agent executions table
    agent_executions_table = """
    CREATE TABLE IF NOT EXISTS agent_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID REFERENCES agents(id),
        workflow_execution_id UUID REFERENCES workflow_executions(id),
        status VARCHAR(50) DEFAULT 'running',
        input_data JSONB,
        output_data JSONB,
        metadata JSONB DEFAULT '{}',
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
    );
    """
    
    # Integrations table
    integrations_table = """
    CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        config JSONB DEFAULT '{}',
        credentials JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'active',
        company_id UUID REFERENCES companies(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Candidates table (for recruiting agent)
    candidates_table = """
    CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'new',
        source VARCHAR(100),
        experience_years INTEGER,
        current_company VARCHAR(255),
        notes TEXT,
        resume_url TEXT,
        metadata JSONB DEFAULT '{}',
        company_id UUID REFERENCES companies(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Deals table
    deals_table = """
    CREATE TABLE IF NOT EXISTS deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'buy', 'sell', 'rent'
        status VARCHAR(50) DEFAULT 'active',
        value DECIMAL(15,2),
        commission DECIMAL(15,2),
        property_address TEXT,
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        client_phone VARCHAR(50),
        agent_id UUID REFERENCES users(id),
        milestones JSONB DEFAULT '[]',
        documents JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        company_id UUID REFERENCES companies(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        closing_date DATE
    );
    """
    
    # Audit log table
    audit_log_table = """
    CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(100) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        user_id UUID REFERENCES users(id),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    # Health check table
    health_check_table = """
    CREATE TABLE IF NOT EXISTS health_check (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status VARCHAR(50) DEFAULT 'healthy',
        checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    tables = [
        ("users", users_table),
        ("companies", companies_table),
        ("agents", agents_table),
        ("workflows", workflows_table),
        ("workflow_executions", workflow_executions_table),
        ("agent_executions", agent_executions_table),
        ("integrations", integrations_table),
        ("candidates", candidates_table),
        ("deals", deals_table),
        ("audit_log", audit_log_table),
        ("health_check", health_check_table)
    ]
    
    for table_name, table_sql in tables:
        try:
            # Note: Supabase doesn't have direct SQL execution in Python client
            # This would typically be done through the Supabase dashboard or migrations
            logger.info(f"Table schema defined for {table_name}")
        except Exception as e:
            logger.error(f"Failed to create table {table_name}: {e}")


async def create_initial_data(supabase: Client):
    """Create initial data for the application"""
    try:
        # Create default company
        company_data = {
            "name": "Impact Realty AI Demo",
            "industry": "real_estate",
            "settings": {
                "timezone": "America/New_York",
                "currency": "USD",
                "features": ["recruiting", "compliance", "deal_management"]
            },
            "subscription_plan": "enterprise"
        }
        
        # Insert default agents
        default_agents = [
            {
                "name": "Recruiting Agent",
                "type": "recruiting_agent",
                "description": "Handles candidate sourcing and qualification",
                "system_prompt": """You are a recruiting agent for Impact Realty AI...""",
                "config": {
                    "temperature": 0.7,
                    "max_iterations": 10,
                    "tools": ["zoho_crm", "email", "calendar"]
                },
                "status": "active"
            },
            {
                "name": "Compliance Agent",
                "type": "compliance_agent",
                "description": "Manages document validation and compliance",
                "system_prompt": """You are a compliance agent for Impact Realty AI...""",
                "config": {
                    "temperature": 0.3,
                    "max_iterations": 5,
                    "tools": ["document_analyzer", "compliance_checker"]
                },
                "status": "active"
            },
            {
                "name": "Deal Management Agent",
                "type": "deal_management_agent",
                "description": "Orchestrates transaction workflows",
                "system_prompt": """You are a deal management agent for Impact Realty AI...""",
                "config": {
                    "temperature": 0.5,
                    "max_iterations": 15,
                    "tools": ["zoho_crm", "broker_sumo", "document_manager"]
                },
                "status": "active"
            }
        ]
        
        # Insert health check record
        health_data = {
            "status": "healthy",
            "checked_at": datetime.now().isoformat()
        }
        
        logger.info("Initial data setup completed")
        
    except Exception as e:
        logger.error(f"Failed to create initial data: {e}")


class DatabaseManager:
    """Database manager for common operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.service_client = get_service_role_client()
    
    async def create_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record"""
        try:
            result = self.supabase.table(table).insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to create record in {table}: {e}")
            raise
    
    async def get_record(self, table: str, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a record by ID"""
        try:
            result = self.supabase.table(table).select("*").eq("id", record_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get record from {table}: {e}")
            raise
    
    async def update_record(self, table: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a record"""
        try:
            data["updated_at"] = datetime.now().isoformat()
            result = self.supabase.table(table).update(data).eq("id", record_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to update record in {table}: {e}")
            raise
    
    async def delete_record(self, table: str, record_id: str) -> bool:
        """Delete a record"""
        try:
            result = self.supabase.table(table).delete().eq("id", record_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Failed to delete record from {table}: {e}")
            raise
    
    async def list_records(
        self, 
        table: str, 
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List records with optional filtering"""
        try:
            query = self.supabase.table(table).select("*")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.range(offset, offset + limit - 1).execute()
            return result.data
        except Exception as e:
            logger.error(f"Failed to list records from {table}: {e}")
            raise
    
    async def log_audit_event(
        self,
        entity_type: str,
        entity_id: str,
        action: str,
        user_id: Optional[str] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None
    ):
        """Log an audit event"""
        try:
            audit_data = {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "action": action,
                "user_id": user_id,
                "old_values": old_values,
                "new_values": new_values,
                "created_at": datetime.now().isoformat()
            }
            
            await self.create_record("audit_log", audit_data)
        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")


# Global database manager instance
db_manager = DatabaseManager() 
"""
Impact Realty AI - Main FastAPI Application
Multi-Agent SaaS Platform for Real Estate Operations
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from typing import Dict, Any

from core.config import settings
from core.database import init_db
from core.logging_config import setup_logging
from api.auth import auth_router
from api.agents import agents_router
from api.workflows import workflows_router
from api.integrations import integrations_router
from api.analytics import analytics_router
from agents.supervisor import SupervisorAgent

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global supervisor agent instance
supervisor_agent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global supervisor_agent
    
    logger.info("Starting Impact Realty AI backend...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    # Initialize supervisor agent
    supervisor_agent = SupervisorAgent()
    await supervisor_agent.initialize()
    logger.info("Supervisor agent initialized")
    
    yield
    
    # Cleanup
    if supervisor_agent:
        await supervisor_agent.shutdown()
    logger.info("Impact Realty AI backend shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Impact Realty AI",
    description="Multi-Agent SaaS Platform for Real Estate Operations",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(agents_router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(workflows_router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(integrations_router, prefix="/api/v1/integrations", tags=["integrations"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Impact Realty AI - Multi-Agent SaaS Platform",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connectivity
        from core.database import get_supabase_client
        supabase = get_supabase_client()
        
        # Simple connectivity test
        response = supabase.table("health_check").select("count", count="exact").execute()
        
        # Check supervisor agent status
        agent_status = "healthy" if supervisor_agent and supervisor_agent.is_healthy() else "unhealthy"
        
        return {
            "status": "healthy",
            "database": "connected",
            "supervisor_agent": agent_status,
            "timestamp": settings.get_current_timestamp()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )


@app.get("/api/v1/status")
async def get_system_status():
    """Get detailed system status"""
    try:
        agent_stats = await supervisor_agent.get_status() if supervisor_agent else {}
        
        return {
            "system": {
                "status": "operational",
                "version": "1.0.0",
                "environment": settings.ENVIRONMENT,
                "timestamp": settings.get_current_timestamp()
            },
            "agents": agent_stats,
            "integrations": {
                "supabase": "connected",
                "zoho": "available",
                "broker_sumo": "available",
                "google_workspace": "available"
            }
        }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system status"
        )


@app.post("/api/v1/agents/execute")
async def execute_agent_workflow(
    request: Dict[str, Any],
    current_user: Dict = Depends(auth_router.get_current_user)
):
    """Execute an agent workflow"""
    try:
        if not supervisor_agent:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supervisor agent not available"
            )
        
        workflow_type = request.get("workflow_type")
        params = request.get("params", {})
        
        # Add user context
        params["user_id"] = current_user.get("id")
        params["user_email"] = current_user.get("email")
        
        # Execute workflow
        result = await supervisor_agent.execute_workflow(workflow_type, params)
        
        return {
            "success": True,
            "workflow_id": result.get("workflow_id"),
            "status": result.get("status"),
            "result": result.get("result"),
            "timestamp": settings.get_current_timestamp()
        }
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )


@app.get("/api/v1/agents/{agent_type}/status")
async def get_agent_status(agent_type: str):
    """Get status of a specific agent"""
    try:
        if not supervisor_agent:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supervisor agent not available"
            )
        
        agent_status = await supervisor_agent.get_agent_status(agent_type)
        
        if not agent_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_type} not found"
            )
        
        return agent_status
        
    except Exception as e:
        logger.error(f"Failed to get agent status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent status: {str(e)}"
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": settings.get_current_timestamp()
        }
    )


def get_supervisor_agent():
    """Dependency to get supervisor agent instance"""
    if not supervisor_agent:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supervisor agent not available"
        )
    return supervisor_agent


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    ) 
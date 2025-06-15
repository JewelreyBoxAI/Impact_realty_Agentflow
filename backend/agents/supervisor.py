"""
Supervisor Agent - Orchestrates all other agents using LangGraph
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional, TypedDict
from datetime import datetime
import uuid

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor
from langgraph.checkpoint.memory import MemorySaver

from core.config import settings, AgentConfig
from core.database import db_manager
from .recruiting import RecruitingAgent
from .compliance import ComplianceAgent
from .deal_management import DealManagementAgent
from .communication import CommunicationAgent
from .analytics import AnalyticsAgent

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State shared between agents in the workflow"""
    messages: List[Dict[str, Any]]
    workflow_id: str
    workflow_type: str
    current_agent: str
    next_agent: Optional[str]
    user_id: str
    company_id: str
    context: Dict[str, Any]
    results: Dict[str, Any]
    errors: List[str]
    completed: bool


class SupervisorAgent:
    """
    Supervisor Agent that orchestrates multi-agent workflows using LangGraph
    """
    
    def __init__(self):
        self.llm = self._initialize_llm()
        self.agents = {}
        self.workflow_graph = None
        self.memory = MemorySaver()
        self.is_initialized = False
        
    def _initialize_llm(self):
        """Initialize the LLM for the supervisor"""
        if settings.DEFAULT_LLM_MODEL.startswith("gpt"):
            return ChatOpenAI(
                model=settings.DEFAULT_LLM_MODEL,
                temperature=0.3,
                api_key=settings.OPENAI_API_KEY
            )
        elif settings.DEFAULT_LLM_MODEL.startswith("claude"):
            return ChatAnthropic(
                model=settings.DEFAULT_LLM_MODEL,
                temperature=0.3,
                api_key=settings.ANTHROPIC_API_KEY
            )
        else:
            # Default to OpenAI
            return ChatOpenAI(
                model="gpt-4-turbo-preview",
                temperature=0.3,
                api_key=settings.OPENAI_API_KEY
            )
    
    async def initialize(self):
        """Initialize all agents and workflow graph"""
        try:
            logger.info("Initializing Supervisor Agent...")
            
            # Initialize individual agents
            self.agents = {
                "recruiting": RecruitingAgent(),
                "compliance": ComplianceAgent(),
                "deal_management": DealManagementAgent(),
                "communication": CommunicationAgent(),
                "analytics": AnalyticsAgent()
            }
            
            # Initialize each agent
            for agent_name, agent in self.agents.items():
                await agent.initialize()
                logger.info(f"Initialized {agent_name} agent")
            
            # Build workflow graph
            self._build_workflow_graph()
            
            self.is_initialized = True
            logger.info("Supervisor Agent initialization completed")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supervisor Agent: {e}")
            raise
    
    def _build_workflow_graph(self):
        """Build the LangGraph workflow"""
        
        # Define the workflow graph
        workflow = StateGraph(AgentState)
        
        # Add nodes for each agent
        workflow.add_node("supervisor", self._supervisor_node)
        workflow.add_node("recruiting", self._recruiting_node)
        workflow.add_node("compliance", self._compliance_node)
        workflow.add_node("deal_management", self._deal_management_node)
        workflow.add_node("communication", self._communication_node)
        workflow.add_node("analytics", self._analytics_node)
        workflow.add_node("end", self._end_node)
        
        # Set entry point
        workflow.set_entry_point("supervisor")
        
        # Add conditional edges from supervisor
        workflow.add_conditional_edges(
            "supervisor",
            self._route_to_agent,
            {
                "recruiting": "recruiting",
                "compliance": "compliance",
                "deal_management": "deal_management",
                "communication": "communication",
                "analytics": "analytics",
                "end": "end"
            }
        )
        
        # Add edges back to supervisor from each agent
        for agent_name in ["recruiting", "compliance", "deal_management", "communication", "analytics"]:
            workflow.add_edge(agent_name, "supervisor")
        
        # End node
        workflow.add_edge("end", END)
        
        # Compile the graph
        self.workflow_graph = workflow.compile(checkpointer=self.memory)
    
    async def _supervisor_node(self, state: AgentState) -> AgentState:
        """Supervisor node that decides which agent to call next"""
        try:
            workflow_type = state["workflow_type"]
            context = state["context"]
            results = state["results"]
            
            # Create supervisor prompt
            system_prompt = f"""You are the Supervisor Agent for Impact Realty AI. 
            
Your role is to orchestrate a multi-agent workflow for: {workflow_type}

Available agents:
- recruiting: Handles candidate sourcing, qualification, and engagement
- compliance: Manages document validation and regulatory compliance  
- deal_management: Orchestrates transaction workflows and deal management
- communication: Handles email, calendar, and CRM communications
- analytics: Provides performance metrics and business insights

Current context: {context}
Previous results: {results}

Analyze the workflow requirements and determine which agent should handle the next step.
If the workflow is complete, respond with 'COMPLETE'.

Respond with only the agent name or 'COMPLETE'."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Workflow: {workflow_type}, Context: {context}")
            ]
            
            response = await self.llm.ainvoke(messages)
            next_agent = response.content.strip().lower()
            
            if next_agent == "complete":
                state["completed"] = True
                state["next_agent"] = "end"
            else:
                state["next_agent"] = next_agent
                state["current_agent"] = next_agent
            
            # Log the decision
            await self._log_workflow_step(
                state["workflow_id"],
                "supervisor",
                "routing_decision",
                {"next_agent": next_agent, "reasoning": response.content}
            )
            
            return state
            
        except Exception as e:
            logger.error(f"Supervisor node error: {e}")
            state["errors"].append(f"Supervisor error: {str(e)}")
            state["next_agent"] = "end"
            return state
    
    def _route_to_agent(self, state: AgentState) -> str:
        """Route to the appropriate agent based on supervisor decision"""
        return state.get("next_agent", "end")
    
    async def _recruiting_node(self, state: AgentState) -> AgentState:
        """Recruiting agent node"""
        try:
            agent = self.agents["recruiting"]
            result = await agent.execute(state["context"])
            
            state["results"]["recruiting"] = result
            state["messages"].append({
                "agent": "recruiting",
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Recruiting agent error: {e}")
            state["errors"].append(f"Recruiting agent error: {str(e)}")
            return state
    
    async def _compliance_node(self, state: AgentState) -> AgentState:
        """Compliance agent node"""
        try:
            agent = self.agents["compliance"]
            result = await agent.execute(state["context"])
            
            state["results"]["compliance"] = result
            state["messages"].append({
                "agent": "compliance",
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Compliance agent error: {e}")
            state["errors"].append(f"Compliance agent error: {str(e)}")
            return state
    
    async def _deal_management_node(self, state: AgentState) -> AgentState:
        """Deal management agent node"""
        try:
            agent = self.agents["deal_management"]
            result = await agent.execute(state["context"])
            
            state["results"]["deal_management"] = result
            state["messages"].append({
                "agent": "deal_management",
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Deal management agent error: {e}")
            state["errors"].append(f"Deal management agent error: {str(e)}")
            return state
    
    async def _communication_node(self, state: AgentState) -> AgentState:
        """Communication agent node"""
        try:
            agent = self.agents["communication"]
            result = await agent.execute(state["context"])
            
            state["results"]["communication"] = result
            state["messages"].append({
                "agent": "communication",
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Communication agent error: {e}")
            state["errors"].append(f"Communication agent error: {str(e)}")
            return state
    
    async def _analytics_node(self, state: AgentState) -> AgentState:
        """Analytics agent node"""
        try:
            agent = self.agents["analytics"]
            result = await agent.execute(state["context"])
            
            state["results"]["analytics"] = result
            state["messages"].append({
                "agent": "analytics",
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Analytics agent error: {e}")
            state["errors"].append(f"Analytics agent error: {str(e)}")
            return state
    
    async def _end_node(self, state: AgentState) -> AgentState:
        """End node - finalize workflow"""
        state["completed"] = True
        
        # Log workflow completion
        await self._log_workflow_completion(
            state["workflow_id"],
            "completed" if not state["errors"] else "failed",
            state["results"],
            state["errors"]
        )
        
        return state
    
    async def execute_workflow(self, workflow_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a multi-agent workflow"""
        try:
            if not self.is_initialized:
                raise Exception("Supervisor agent not initialized")
            
            workflow_id = str(uuid.uuid4())
            
            # Create initial state
            initial_state = AgentState(
                messages=[],
                workflow_id=workflow_id,
                workflow_type=workflow_type,
                current_agent="supervisor",
                next_agent=None,
                user_id=params.get("user_id", ""),
                company_id=params.get("company_id", ""),
                context=params,
                results={},
                errors=[],
                completed=False
            )
            
            # Log workflow start
            await self._log_workflow_start(workflow_id, workflow_type, params)
            
            # Execute the workflow
            config = {"configurable": {"thread_id": workflow_id}}
            final_state = await self.workflow_graph.ainvoke(initial_state, config)
            
            return {
                "workflow_id": workflow_id,
                "status": "completed" if final_state["completed"] and not final_state["errors"] else "failed",
                "result": final_state["results"],
                "messages": final_state["messages"],
                "errors": final_state["errors"]
            }
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {
                "workflow_id": workflow_id if 'workflow_id' in locals() else str(uuid.uuid4()),
                "status": "failed",
                "error": str(e),
                "result": {},
                "messages": [],
                "errors": [str(e)]
            }
    
    async def get_status(self) -> Dict[str, Any]:
        """Get supervisor and all agent statuses"""
        try:
            agent_statuses = {}
            
            for agent_name, agent in self.agents.items():
                agent_statuses[agent_name] = await agent.get_status()
            
            return {
                "supervisor": {
                    "status": "healthy" if self.is_initialized else "initializing",
                    "initialized": self.is_initialized,
                    "llm_model": settings.DEFAULT_LLM_MODEL
                },
                "agents": agent_statuses,
                "workflow_graph": "compiled" if self.workflow_graph else "not_compiled"
            }
            
        except Exception as e:
            logger.error(f"Failed to get status: {e}")
            return {"error": str(e)}
    
    async def get_agent_status(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific agent"""
        if agent_type in self.agents:
            return await self.agents[agent_type].get_status()
        return None
    
    def is_healthy(self) -> bool:
        """Check if supervisor is healthy"""
        return self.is_initialized and self.workflow_graph is not None
    
    async def shutdown(self):
        """Shutdown supervisor and all agents"""
        try:
            logger.info("Shutting down Supervisor Agent...")
            
            for agent_name, agent in self.agents.items():
                await agent.shutdown()
                logger.info(f"Shutdown {agent_name} agent")
            
            self.is_initialized = False
            logger.info("Supervisor Agent shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
    
    async def _log_workflow_start(self, workflow_id: str, workflow_type: str, params: Dict[str, Any]):
        """Log workflow start"""
        try:
            await db_manager.create_record("workflow_executions", {
                "id": workflow_id,
                "workflow_id": workflow_id,  # For compatibility
                "status": "running",
                "input_data": params,
                "started_at": datetime.now().isoformat(),
                "executed_by": params.get("user_id")
            })
        except Exception as e:
            logger.error(f"Failed to log workflow start: {e}")
    
    async def _log_workflow_step(self, workflow_id: str, agent: str, action: str, data: Dict[str, Any]):
        """Log individual workflow step"""
        try:
            # This could be stored in a separate workflow_steps table
            logger.info(f"Workflow {workflow_id} - {agent}: {action}")
        except Exception as e:
            logger.error(f"Failed to log workflow step: {e}")
    
    async def _log_workflow_completion(self, workflow_id: str, status: str, results: Dict[str, Any], errors: List[str]):
        """Log workflow completion"""
        try:
            await db_manager.update_record("workflow_executions", workflow_id, {
                "status": status,
                "output_data": results,
                "error_message": "; ".join(errors) if errors else None,
                "completed_at": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to log workflow completion: {e}") 
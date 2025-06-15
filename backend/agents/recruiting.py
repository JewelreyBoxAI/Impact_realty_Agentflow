"""
Recruiting Agent - Handles candidate sourcing, qualification, and engagement
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

from core.config import settings, AgentConfig
from core.database import db_manager
from integrations.zoho import ZohoIntegration
from integrations.google import GoogleIntegration

logger = logging.getLogger(__name__)


class RecruitingAgent:
    """
    Recruiting Agent that handles candidate sourcing, qualification, and engagement
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=AgentConfig.RECRUITING_AGENT["temperature"],
            api_key=settings.OPENAI_API_KEY
        )
        self.config = AgentConfig.RECRUITING_AGENT
        self.zoho = None
        self.google = None
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize the recruiting agent and its integrations"""
        try:
            logger.info("Initializing Recruiting Agent...")
            
            # Initialize integrations
            if not settings.is_mock_mode():
                self.zoho = ZohoIntegration()
                await self.zoho.initialize()
                
                self.google = GoogleIntegration()
                await self.google.initialize()
            
            self.is_initialized = True
            logger.info("Recruiting Agent initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Recruiting Agent: {e}")
            raise
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute recruiting workflow based on context"""
        try:
            task_type = context.get("task_type", "general_recruiting")
            
            if task_type == "source_candidates":
                return await self._source_candidates(context)
            elif task_type == "qualify_candidate":
                return await self._qualify_candidate(context)
            elif task_type == "schedule_interview":
                return await self._schedule_interview(context)
            elif task_type == "follow_up":
                return await self._follow_up_candidate(context)
            elif task_type == "update_pipeline":
                return await self._update_pipeline(context)
            else:
                return await self._general_recruiting_task(context)
                
        except Exception as e:
            logger.error(f"Recruiting agent execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _source_candidates(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Source candidates based on job requirements"""
        try:
            job_requirements = context.get("job_requirements", {})
            location = context.get("location", "")
            experience_level = context.get("experience_level", "")
            
            # Create sourcing prompt
            system_prompt = f"""You are a recruiting agent tasked with sourcing real estate agent candidates.
            
Job Requirements: {job_requirements}
Location: {location}
Experience Level: {experience_level}

Your task is to:
1. Analyze the job requirements
2. Identify key qualifications and skills needed
3. Suggest sourcing strategies and channels
4. Create candidate search criteria
5. Recommend outreach messaging

Provide a structured response with actionable sourcing recommendations."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Source candidates for: {job_requirements}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # If not in mock mode, actually search for candidates
            candidates = []
            if not settings.is_mock_mode() and self.zoho:
                candidates = await self._search_candidates_in_crm(job_requirements)
            else:
                # Mock candidates for demo
                candidates = self._generate_mock_candidates()
            
            return {
                "success": True,
                "sourcing_strategy": response.content,
                "candidates_found": len(candidates),
                "candidates": candidates,
                "recommendations": self._extract_recommendations(response.content),
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"Candidate sourcing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _qualify_candidate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Qualify a candidate based on requirements"""
        try:
            candidate_info = context.get("candidate", {})
            job_requirements = context.get("job_requirements", {})
            
            # Create qualification prompt
            system_prompt = f"""You are a recruiting agent evaluating a candidate for a real estate agent position.

Candidate Information: {candidate_info}
Job Requirements: {job_requirements}

Evaluate the candidate on:
1. Experience and qualifications
2. Skills match with requirements
3. Cultural fit indicators
4. Potential red flags
5. Overall recommendation (Hire/No Hire/Interview)

Provide a structured evaluation with scores and reasoning."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Evaluate candidate: {candidate_info.get('name', 'Unknown')}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Extract qualification score
            qualification_score = self._extract_qualification_score(response.content)
            
            # Update candidate in database
            if candidate_info.get("id"):
                await self._update_candidate_status(
                    candidate_info["id"],
                    "qualified" if qualification_score >= 70 else "not_qualified",
                    response.content
                )
            
            return {
                "success": True,
                "candidate_id": candidate_info.get("id"),
                "qualification_score": qualification_score,
                "evaluation": response.content,
                "recommendation": "proceed" if qualification_score >= 70 else "reject",
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"Candidate qualification failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _schedule_interview(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule an interview with a candidate"""
        try:
            candidate_info = context.get("candidate", {})
            interviewer_email = context.get("interviewer_email", "")
            preferred_times = context.get("preferred_times", [])
            
            # Create scheduling prompt
            system_prompt = f"""You are a recruiting agent scheduling an interview.

Candidate: {candidate_info.get('name', 'Unknown')}
Candidate Email: {candidate_info.get('email', '')}
Interviewer: {interviewer_email}
Preferred Times: {preferred_times}

Create a professional interview invitation email and suggest optimal scheduling."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content="Create interview scheduling communication")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # If not in mock mode, actually schedule the interview
            calendar_event = None
            if not settings.is_mock_mode() and self.google:
                calendar_event = await self._create_calendar_event(
                    candidate_info,
                    interviewer_email,
                    preferred_times[0] if preferred_times else None
                )
            else:
                # Mock calendar event
                calendar_event = {
                    "id": "mock_event_123",
                    "title": f"Interview with {candidate_info.get('name', 'Candidate')}",
                    "start_time": preferred_times[0] if preferred_times else "2024-01-15T10:00:00Z",
                    "meeting_link": "https://meet.google.com/mock-meeting-link"
                }
            
            # Send invitation email
            email_sent = await self._send_interview_invitation(
                candidate_info.get("email", ""),
                response.content,
                calendar_event
            )
            
            return {
                "success": True,
                "candidate_id": candidate_info.get("id"),
                "calendar_event": calendar_event,
                "email_sent": email_sent,
                "invitation_content": response.content,
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"Interview scheduling failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _follow_up_candidate(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Follow up with a candidate"""
        try:
            candidate_info = context.get("candidate", {})
            follow_up_type = context.get("follow_up_type", "general")
            last_interaction = context.get("last_interaction", "")
            
            # Create follow-up prompt
            system_prompt = f"""You are a recruiting agent following up with a candidate.

Candidate: {candidate_info.get('name', 'Unknown')}
Follow-up Type: {follow_up_type}
Last Interaction: {last_interaction}

Create a personalized, professional follow-up message that:
1. References the last interaction
2. Provides relevant updates
3. Includes clear next steps
4. Maintains engagement"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Create follow-up for {follow_up_type}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Send follow-up email
            email_sent = await self._send_follow_up_email(
                candidate_info.get("email", ""),
                response.content
            )
            
            # Update candidate interaction history
            await self._log_candidate_interaction(
                candidate_info.get("id"),
                "follow_up",
                response.content
            )
            
            return {
                "success": True,
                "candidate_id": candidate_info.get("id"),
                "follow_up_content": response.content,
                "email_sent": email_sent,
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"Candidate follow-up failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _update_pipeline(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Update recruiting pipeline and metrics"""
        try:
            # Get current pipeline data
            pipeline_data = await self._get_pipeline_data()
            
            # Create pipeline analysis prompt
            system_prompt = f"""You are a recruiting agent analyzing the current pipeline.

Current Pipeline Data: {pipeline_data}

Analyze and provide:
1. Pipeline health assessment
2. Bottleneck identification
3. Conversion rate analysis
4. Recommendations for improvement
5. Action items for next steps"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content="Analyze current recruiting pipeline")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Update pipeline metrics
            metrics = await self._calculate_pipeline_metrics(pipeline_data)
            
            return {
                "success": True,
                "pipeline_analysis": response.content,
                "metrics": metrics,
                "recommendations": self._extract_recommendations(response.content),
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"Pipeline update failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    async def _general_recruiting_task(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general recruiting tasks"""
        try:
            task_description = context.get("description", "")
            
            system_prompt = self.config["system_prompt"]
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Task: {task_description}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            return {
                "success": True,
                "response": response.content,
                "agent": "recruiting"
            }
            
        except Exception as e:
            logger.error(f"General recruiting task failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "recruiting"
            }
    
    # Helper methods
    
    async def _search_candidates_in_crm(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search for candidates in CRM system"""
        if self.zoho:
            return await self.zoho.search_contacts(requirements)
        return []
    
    def _generate_mock_candidates(self) -> List[Dict[str, Any]]:
        """Generate mock candidates for demo purposes"""
        return [
            {
                "id": "mock_candidate_1",
                "name": "Sarah Johnson",
                "email": "sarah.johnson@email.com",
                "phone": "(555) 123-4567",
                "experience_years": 5,
                "current_company": "ABC Realty",
                "status": "active",
                "source": "LinkedIn"
            },
            {
                "id": "mock_candidate_2",
                "name": "Mike Chen",
                "email": "mike.chen@email.com",
                "phone": "(555) 234-5678",
                "experience_years": 3,
                "current_company": "XYZ Properties",
                "status": "passive",
                "source": "Referral"
            }
        ]
    
    def _extract_qualification_score(self, evaluation_text: str) -> int:
        """Extract qualification score from evaluation text"""
        # Simple extraction logic - in production, this would be more sophisticated
        if "highly qualified" in evaluation_text.lower():
            return 85
        elif "qualified" in evaluation_text.lower():
            return 75
        elif "partially qualified" in evaluation_text.lower():
            return 60
        else:
            return 45
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract actionable recommendations from text"""
        # Simple extraction - in production, this would use NLP
        recommendations = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'action']):
                recommendations.append(line.strip())
        return recommendations[:5]  # Limit to top 5
    
    async def _update_candidate_status(self, candidate_id: str, status: str, notes: str):
        """Update candidate status in database"""
        try:
            await db_manager.update_record("candidates", candidate_id, {
                "status": status,
                "notes": notes,
                "updated_at": datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to update candidate status: {e}")
    
    async def _create_calendar_event(self, candidate: Dict, interviewer_email: str, time_slot: str):
        """Create calendar event for interview"""
        if self.google:
            return await self.google.create_calendar_event({
                "title": f"Interview with {candidate.get('name', 'Candidate')}",
                "start_time": time_slot,
                "attendees": [candidate.get("email"), interviewer_email],
                "description": f"Interview with candidate {candidate.get('name')}"
            })
        return None
    
    async def _send_interview_invitation(self, candidate_email: str, content: str, calendar_event: Dict):
        """Send interview invitation email"""
        if settings.is_mock_mode():
            logger.info(f"Mock: Sending interview invitation to {candidate_email}")
            return True
        
        if self.google:
            return await self.google.send_email({
                "to": candidate_email,
                "subject": "Interview Invitation - Impact Realty AI",
                "body": content,
                "calendar_event": calendar_event
            })
        return False
    
    async def _send_follow_up_email(self, candidate_email: str, content: str):
        """Send follow-up email to candidate"""
        if settings.is_mock_mode():
            logger.info(f"Mock: Sending follow-up email to {candidate_email}")
            return True
        
        if self.google:
            return await self.google.send_email({
                "to": candidate_email,
                "subject": "Follow-up - Impact Realty AI Opportunity",
                "body": content
            })
        return False
    
    async def _log_candidate_interaction(self, candidate_id: str, interaction_type: str, content: str):
        """Log candidate interaction"""
        try:
            # This could be stored in a candidate_interactions table
            logger.info(f"Candidate {candidate_id} interaction: {interaction_type}")
        except Exception as e:
            logger.error(f"Failed to log candidate interaction: {e}")
    
    async def _get_pipeline_data(self) -> Dict[str, Any]:
        """Get current pipeline data"""
        try:
            # Get candidates by status
            candidates = await db_manager.list_records("candidates")
            
            pipeline_data = {
                "total_candidates": len(candidates),
                "by_status": {},
                "by_source": {},
                "recent_activity": []
            }
            
            for candidate in candidates:
                status = candidate.get("status", "unknown")
                source = candidate.get("source", "unknown")
                
                pipeline_data["by_status"][status] = pipeline_data["by_status"].get(status, 0) + 1
                pipeline_data["by_source"][source] = pipeline_data["by_source"].get(source, 0) + 1
            
            return pipeline_data
            
        except Exception as e:
            logger.error(f"Failed to get pipeline data: {e}")
            return {}
    
    async def _calculate_pipeline_metrics(self, pipeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate pipeline metrics"""
        try:
            total = pipeline_data.get("total_candidates", 0)
            by_status = pipeline_data.get("by_status", {})
            
            metrics = {
                "total_candidates": total,
                "qualified_rate": (by_status.get("qualified", 0) / total * 100) if total > 0 else 0,
                "interview_rate": (by_status.get("interview", 0) / total * 100) if total > 0 else 0,
                "hire_rate": (by_status.get("hired", 0) / total * 100) if total > 0 else 0,
                "active_candidates": by_status.get("active", 0),
                "pipeline_health": "good" if total > 10 else "needs_attention"
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to calculate metrics: {e}")
            return {}
    
    async def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "name": self.config["name"],
            "status": "healthy" if self.is_initialized else "initializing",
            "initialized": self.is_initialized,
            "integrations": {
                "zoho": "connected" if self.zoho else "not_connected",
                "google": "connected" if self.google else "not_connected"
            },
            "mock_mode": settings.is_mock_mode()
        }
    
    async def shutdown(self):
        """Shutdown agent and cleanup resources"""
        try:
            if self.zoho:
                await self.zoho.shutdown()
            if self.google:
                await self.google.shutdown()
            
            self.is_initialized = False
            logger.info("Recruiting Agent shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during Recruiting Agent shutdown: {e}") 
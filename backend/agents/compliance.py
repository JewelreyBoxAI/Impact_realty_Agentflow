"""
Compliance Agent - Manages document validation and regulatory compliance
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import re

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from core.config import settings, AgentConfig
from core.database import db_manager

logger = logging.getLogger(__name__)


class ComplianceAgent:
    """
    Compliance Agent that manages document validation and regulatory compliance
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=AgentConfig.COMPLIANCE_AGENT["temperature"],
            api_key=settings.OPENAI_API_KEY
        )
        self.config = AgentConfig.COMPLIANCE_AGENT
        self.is_initialized = False
        
        # Florida Real Estate Commission (FREC) compliance rules
        self.frec_rules = {
            "license_requirements": [
                "Active real estate license required",
                "License must be current and in good standing",
                "Continuing education requirements met"
            ],
            "disclosure_requirements": [
                "Property condition disclosure",
                "Lead-based paint disclosure (pre-1978 properties)",
                "Flood zone disclosure",
                "HOA disclosure if applicable"
            ],
            "contract_requirements": [
                "Purchase and sale agreement must be complete",
                "All parties must sign and date",
                "Earnest money deposit documented",
                "Closing date specified"
            ],
            "equal_housing": [
                "No discrimination based on protected classes",
                "Equal Housing Opportunity logo displayed",
                "Fair housing compliance in all marketing"
            ]
        }
    
    async def initialize(self):
        """Initialize the compliance agent"""
        try:
            logger.info("Initializing Compliance Agent...")
            self.is_initialized = True
            logger.info("Compliance Agent initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Compliance Agent: {e}")
            raise
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute compliance workflow based on context"""
        try:
            task_type = context.get("task_type", "general_compliance")
            
            if task_type == "validate_document":
                return await self._validate_document(context)
            elif task_type == "check_license":
                return await self._check_license_compliance(context)
            elif task_type == "review_contract":
                return await self._review_contract(context)
            elif task_type == "audit_deal":
                return await self._audit_deal_compliance(context)
            elif task_type == "generate_report":
                return await self._generate_compliance_report(context)
            else:
                return await self._general_compliance_task(context)
                
        except Exception as e:
            logger.error(f"Compliance agent execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _validate_document(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a real estate document for compliance"""
        try:
            document_info = context.get("document", {})
            document_type = document_info.get("type", "")
            document_content = document_info.get("content", "")
            
            # Create validation prompt
            system_prompt = f"""You are a compliance agent specializing in Florida real estate regulations.

Document Type: {document_type}
Document Content: {document_content}

FREC Compliance Rules:
{self._format_compliance_rules()}

Validate this document for:
1. Required fields and information
2. FREC compliance requirements
3. Legal accuracy and completeness
4. Missing signatures or dates
5. Potential compliance issues

Provide a detailed compliance assessment with specific issues and recommendations."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Validate {document_type} document for compliance")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Extract compliance score and issues
            compliance_score = self._extract_compliance_score(response.content)
            issues = self._extract_compliance_issues(response.content)
            
            # Log compliance check
            await self._log_compliance_check(
                document_info.get("id", ""),
                document_type,
                compliance_score,
                issues
            )
            
            return {
                "success": True,
                "document_id": document_info.get("id"),
                "document_type": document_type,
                "compliance_score": compliance_score,
                "validation_result": response.content,
                "issues": issues,
                "compliant": compliance_score >= 85,
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"Document validation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _check_license_compliance(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check agent license compliance"""
        try:
            agent_info = context.get("agent", {})
            license_number = agent_info.get("license_number", "")
            
            # Create license check prompt
            system_prompt = f"""You are a compliance agent checking real estate license compliance.

Agent Information: {agent_info}
License Number: {license_number}

Check for:
1. License validity and status
2. Expiration dates
3. Continuing education compliance
4. Any disciplinary actions
5. License type appropriateness

Provide a comprehensive license compliance assessment."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Check license compliance for agent {agent_info.get('name', 'Unknown')}")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # In production, this would integrate with FREC database
            license_status = self._mock_license_check(license_number)
            
            return {
                "success": True,
                "agent_id": agent_info.get("id"),
                "license_number": license_number,
                "license_status": license_status,
                "compliance_assessment": response.content,
                "compliant": license_status.get("valid", False),
                "expiration_date": license_status.get("expiration_date"),
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"License compliance check failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _review_contract(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Review a real estate contract for compliance"""
        try:
            contract_info = context.get("contract", {})
            contract_type = contract_info.get("type", "purchase_agreement")
            
            # Create contract review prompt
            system_prompt = f"""You are a compliance agent reviewing a {contract_type}.

Contract Information: {contract_info}

Review for FREC compliance including:
1. Required contract elements
2. Proper disclosures
3. Signature requirements
4. Date completeness
5. Financial terms clarity
6. Contingency clauses
7. Equal Housing compliance

Provide detailed review with specific compliance issues and recommendations."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Review {contract_type} for compliance")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Extract contract issues
            contract_issues = self._extract_contract_issues(response.content)
            compliance_score = self._calculate_contract_score(contract_issues)
            
            return {
                "success": True,
                "contract_id": contract_info.get("id"),
                "contract_type": contract_type,
                "compliance_score": compliance_score,
                "review_result": response.content,
                "issues": contract_issues,
                "approved": compliance_score >= 90,
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"Contract review failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _audit_deal_compliance(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Audit a complete deal for compliance"""
        try:
            deal_info = context.get("deal", {})
            deal_id = deal_info.get("id", "")
            
            # Get deal documents and information
            deal_documents = await self._get_deal_documents(deal_id)
            
            # Create audit prompt
            system_prompt = f"""You are a compliance agent conducting a comprehensive deal audit.

Deal Information: {deal_info}
Documents: {deal_documents}

Conduct a full compliance audit covering:
1. All required documents present
2. Proper signatures and dates
3. Disclosure compliance
4. License verification
5. Financial documentation
6. Timeline compliance
7. Equal Housing compliance

Provide a comprehensive audit report with compliance rating and action items."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Audit deal {deal_id} for full compliance")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Calculate overall compliance rating
            audit_score = self._calculate_audit_score(response.content)
            action_items = self._extract_action_items(response.content)
            
            # Log audit results
            await self._log_deal_audit(deal_id, audit_score, action_items)
            
            return {
                "success": True,
                "deal_id": deal_id,
                "audit_score": audit_score,
                "audit_report": response.content,
                "action_items": action_items,
                "compliant": audit_score >= 85,
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"Deal audit failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _generate_compliance_report(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate compliance report for a time period"""
        try:
            report_period = context.get("period", "monthly")
            company_id = context.get("company_id", "")
            
            # Get compliance data
            compliance_data = await self._get_compliance_data(company_id, report_period)
            
            # Create report prompt
            system_prompt = f"""You are a compliance agent generating a {report_period} compliance report.

Compliance Data: {compliance_data}

Generate a comprehensive report including:
1. Overall compliance metrics
2. Common compliance issues
3. Trend analysis
4. Risk assessment
5. Recommendations for improvement
6. Action plan for next period

Provide executive summary and detailed findings."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Generate {report_period} compliance report")
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Save report
            report_id = await self._save_compliance_report(
                company_id,
                report_period,
                response.content,
                compliance_data
            )
            
            return {
                "success": True,
                "report_id": report_id,
                "report_period": report_period,
                "report_content": response.content,
                "metrics": compliance_data.get("metrics", {}),
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"Compliance report generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    async def _general_compliance_task(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general compliance tasks"""
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
                "agent": "compliance"
            }
            
        except Exception as e:
            logger.error(f"General compliance task failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": "compliance"
            }
    
    # Helper methods
    
    def _format_compliance_rules(self) -> str:
        """Format FREC compliance rules for prompt"""
        formatted_rules = []
        for category, rules in self.frec_rules.items():
            formatted_rules.append(f"{category.upper()}:")
            for rule in rules:
                formatted_rules.append(f"  - {rule}")
            formatted_rules.append("")
        return "\n".join(formatted_rules)
    
    def _extract_compliance_score(self, assessment_text: str) -> int:
        """Extract compliance score from assessment text"""
        # Look for score patterns
        score_patterns = [
            r'score[:\s]+(\d+)',
            r'rating[:\s]+(\d+)',
            r'(\d+)%',
            r'(\d+)/100'
        ]
        
        for pattern in score_patterns:
            match = re.search(pattern, assessment_text.lower())
            if match:
                return int(match.group(1))
        
        # Default scoring based on keywords
        if "excellent" in assessment_text.lower() or "fully compliant" in assessment_text.lower():
            return 95
        elif "good" in assessment_text.lower() or "mostly compliant" in assessment_text.lower():
            return 85
        elif "fair" in assessment_text.lower() or "partially compliant" in assessment_text.lower():
            return 70
        else:
            return 60
    
    def _extract_compliance_issues(self, assessment_text: str) -> List[str]:
        """Extract compliance issues from assessment text"""
        issues = []
        lines = assessment_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['issue', 'problem', 'missing', 'required', 'violation']):
                if line and not line.startswith('#'):
                    issues.append(line)
        
        return issues[:10]  # Limit to top 10 issues
    
    def _extract_contract_issues(self, review_text: str) -> List[Dict[str, Any]]:
        """Extract contract issues with severity"""
        issues = []
        lines = review_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['critical', 'major', 'minor', 'issue']):
                severity = "minor"
                if "critical" in line.lower():
                    severity = "critical"
                elif "major" in line.lower():
                    severity = "major"
                
                issues.append({
                    "description": line,
                    "severity": severity,
                    "category": "contract_compliance"
                })
        
        return issues[:15]
    
    def _calculate_contract_score(self, issues: List[Dict[str, Any]]) -> int:
        """Calculate contract compliance score based on issues"""
        base_score = 100
        
        for issue in issues:
            if issue["severity"] == "critical":
                base_score -= 15
            elif issue["severity"] == "major":
                base_score -= 10
            else:
                base_score -= 5
        
        return max(base_score, 0)
    
    def _calculate_audit_score(self, audit_text: str) -> int:
        """Calculate overall audit score"""
        # Count positive and negative indicators
        positive_indicators = ['compliant', 'complete', 'proper', 'correct', 'valid']
        negative_indicators = ['missing', 'incomplete', 'violation', 'issue', 'problem']
        
        positive_count = sum(audit_text.lower().count(word) for word in positive_indicators)
        negative_count = sum(audit_text.lower().count(word) for word in negative_indicators)
        
        if positive_count + negative_count == 0:
            return 75  # Default score
        
        score = (positive_count / (positive_count + negative_count)) * 100
        return int(score)
    
    def _extract_action_items(self, audit_text: str) -> List[str]:
        """Extract action items from audit text"""
        action_items = []
        lines = audit_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['action', 'recommend', 'should', 'must', 'need']):
                if line and len(line) > 10:
                    action_items.append(line)
        
        return action_items[:10]
    
    def _mock_license_check(self, license_number: str) -> Dict[str, Any]:
        """Mock license check for demo purposes"""
        if settings.is_mock_mode():
            return {
                "valid": True,
                "status": "active",
                "expiration_date": "2024-12-31",
                "license_type": "sales_associate",
                "continuing_education": "current"
            }
        
        # In production, this would query FREC database
        return {
            "valid": bool(license_number),
            "status": "active" if license_number else "inactive",
            "expiration_date": "2024-12-31",
            "license_type": "sales_associate",
            "continuing_education": "current"
        }
    
    async def _get_deal_documents(self, deal_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a deal"""
        try:
            deal = await db_manager.get_record("deals", deal_id)
            if deal:
                return deal.get("documents", [])
            return []
        except Exception as e:
            logger.error(f"Failed to get deal documents: {e}")
            return []
    
    async def _get_compliance_data(self, company_id: str, period: str) -> Dict[str, Any]:
        """Get compliance data for reporting"""
        try:
            # This would query various compliance-related tables
            return {
                "total_deals": 25,
                "compliant_deals": 22,
                "compliance_rate": 88,
                "common_issues": [
                    "Missing signatures",
                    "Incomplete disclosures",
                    "Date inconsistencies"
                ],
                "metrics": {
                    "document_compliance": 85,
                    "license_compliance": 95,
                    "contract_compliance": 80
                }
            }
        except Exception as e:
            logger.error(f"Failed to get compliance data: {e}")
            return {}
    
    async def _log_compliance_check(self, document_id: str, document_type: str, score: int, issues: List[str]):
        """Log compliance check results"""
        try:
            await db_manager.log_audit_event(
                "document",
                document_id,
                "compliance_check",
                old_values=None,
                new_values={
                    "compliance_score": score,
                    "issues": issues,
                    "document_type": document_type
                }
            )
        except Exception as e:
            logger.error(f"Failed to log compliance check: {e}")
    
    async def _log_deal_audit(self, deal_id: str, audit_score: int, action_items: List[str]):
        """Log deal audit results"""
        try:
            await db_manager.log_audit_event(
                "deal",
                deal_id,
                "compliance_audit",
                old_values=None,
                new_values={
                    "audit_score": audit_score,
                    "action_items": action_items
                }
            )
        except Exception as e:
            logger.error(f"Failed to log deal audit: {e}")
    
    async def _save_compliance_report(self, company_id: str, period: str, content: str, data: Dict[str, Any]) -> str:
        """Save compliance report"""
        try:
            report_data = {
                "company_id": company_id,
                "report_type": "compliance",
                "period": period,
                "content": content,
                "data": data,
                "generated_at": datetime.now().isoformat()
            }
            
            # This would save to a reports table
            report_id = f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            logger.info(f"Saved compliance report: {report_id}")
            return report_id
            
        except Exception as e:
            logger.error(f"Failed to save compliance report: {e}")
            return ""
    
    async def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "name": self.config["name"],
            "status": "healthy" if self.is_initialized else "initializing",
            "initialized": self.is_initialized,
            "compliance_rules": len(self.frec_rules),
            "mock_mode": settings.is_mock_mode()
        }
    
    async def shutdown(self):
        """Shutdown agent and cleanup resources"""
        try:
            self.is_initialized = False
            logger.info("Compliance Agent shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during Compliance Agent shutdown: {e}") 
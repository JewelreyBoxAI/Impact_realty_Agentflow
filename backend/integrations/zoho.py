"""
Zoho CRM Integration using MCP (Model Context Protocol)
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
import httpx
import json
from datetime import datetime, timedelta

from core.config import settings, MCPConfig

logger = logging.getLogger(__name__)


class ZohoIntegration:
    """
    Zoho CRM integration using MCP protocol for real estate operations
    """
    
    def __init__(self):
        self.config = MCPConfig.ZOHO_MCP
        self.base_url = self.config["base_url"]
        self.access_token = None
        self.token_expires_at = None
        self.client = None
        self.is_initialized = False
    
    async def initialize(self):
        """Initialize Zoho integration"""
        try:
            logger.info("Initializing Zoho CRM integration...")
            
            if settings.is_mock_mode():
                logger.info("Running in mock mode - Zoho integration mocked")
                self.is_initialized = True
                return
            
            # Initialize HTTP client
            self.client = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
            
            # Get access token
            await self._refresh_access_token()
            
            self.is_initialized = True
            logger.info("Zoho CRM integration initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Zoho integration: {e}")
            raise
    
    async def _refresh_access_token(self):
        """Refresh Zoho access token using refresh token"""
        try:
            if not settings.ZOHO_CLIENT_ID or not settings.ZOHO_CLIENT_SECRET or not settings.ZOHO_REFRESH_TOKEN:
                logger.warning("Zoho credentials not configured")
                return
            
            token_url = "https://accounts.zoho.com/oauth/v2/token"
            
            data = {
                "refresh_token": settings.ZOHO_REFRESH_TOKEN,
                "client_id": settings.ZOHO_CLIENT_ID,
                "client_secret": settings.ZOHO_CLIENT_SECRET,
                "grant_type": "refresh_token"
            }
            
            response = await self.client.post(token_url, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)  # 5 min buffer
            
            # Update client headers
            self.client.headers.update({
                "Authorization": f"Zoho-oauthtoken {self.access_token}"
            })
            
            logger.info("Zoho access token refreshed successfully")
            
        except Exception as e:
            logger.error(f"Failed to refresh Zoho access token: {e}")
            raise
    
    async def _ensure_valid_token(self):
        """Ensure we have a valid access token"""
        if not self.access_token or (self.token_expires_at and datetime.now() >= self.token_expires_at):
            await self._refresh_access_token()
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make authenticated request to Zoho API"""
        if settings.is_mock_mode():
            return self._mock_response(method, endpoint, data, params)
        
        try:
            await self._ensure_valid_token()
            
            url = f"{self.base_url}/{endpoint}"
            
            if method.upper() == "GET":
                response = await self.client.get(url, params=params)
            elif method.upper() == "POST":
                response = await self.client.post(url, json=data, params=params)
            elif method.upper() == "PUT":
                response = await self.client.put(url, json=data, params=params)
            elif method.upper() == "DELETE":
                response = await self.client.delete(url, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            logger.error(f"Zoho API request failed: {e}")
            raise
    
    def _mock_response(self, method: str, endpoint: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate mock responses for testing"""
        if "contacts" in endpoint.lower():
            if method.upper() == "GET":
                return {
                    "data": [
                        {
                            "id": "mock_contact_1",
                            "First_Name": "John",
                            "Last_Name": "Doe",
                            "Email": "john.doe@email.com",
                            "Phone": "(555) 123-4567",
                            "Lead_Source": "Website",
                            "Created_Time": "2024-01-01T10:00:00Z"
                        },
                        {
                            "id": "mock_contact_2",
                            "First_Name": "Jane",
                            "Last_Name": "Smith",
                            "Email": "jane.smith@email.com",
                            "Phone": "(555) 234-5678",
                            "Lead_Source": "Referral",
                            "Created_Time": "2024-01-02T11:00:00Z"
                        }
                    ],
                    "info": {
                        "count": 2,
                        "more_records": False
                    }
                }
            elif method.upper() == "POST":
                return {
                    "data": [
                        {
                            "code": "SUCCESS",
                            "details": {
                                "Modified_Time": datetime.now().isoformat(),
                                "Modified_By": {"name": "API User"},
                                "Created_Time": datetime.now().isoformat(),
                                "id": f"mock_contact_{datetime.now().timestamp()}"
                            },
                            "message": "record added",
                            "status": "success"
                        }
                    ]
                }
        
        elif "deals" in endpoint.lower():
            if method.upper() == "GET":
                return {
                    "data": [
                        {
                            "id": "mock_deal_1",
                            "Deal_Name": "123 Main St Sale",
                            "Amount": 450000,
                            "Stage": "Negotiation/Review",
                            "Contact_Name": {"name": "John Doe", "id": "mock_contact_1"},
                            "Closing_Date": "2024-02-15",
                            "Created_Time": "2024-01-01T10:00:00Z"
                        }
                    ],
                    "info": {
                        "count": 1,
                        "more_records": False
                    }
                }
        
        elif "leads" in endpoint.lower():
            if method.upper() == "GET":
                return {
                    "data": [
                        {
                            "id": "mock_lead_1",
                            "First_Name": "Sarah",
                            "Last_Name": "Johnson",
                            "Email": "sarah.johnson@email.com",
                            "Phone": "(555) 345-6789",
                            "Lead_Status": "Not Contacted",
                            "Lead_Source": "Advertisement",
                            "Created_Time": "2024-01-03T09:00:00Z"
                        }
                    ],
                    "info": {
                        "count": 1,
                        "more_records": False
                    }
                }
        
        # Default mock response
        return {
            "data": [],
            "info": {"count": 0, "more_records": False}
        }
    
    # MCP Tool Implementations
    
    async def get_contacts(self, filters: Optional[Dict[str, Any]] = None, limit: int = 200) -> List[Dict[str, Any]]:
        """Get contacts from Zoho CRM"""
        try:
            params = {"per_page": min(limit, 200)}
            
            if filters:
                # Convert filters to Zoho criteria format
                criteria = self._build_criteria(filters)
                if criteria:
                    params["criteria"] = criteria
            
            response = await self._make_request("GET", "Contacts", params=params)
            return response.get("data", [])
            
        except Exception as e:
            logger.error(f"Failed to get contacts: {e}")
            return []
    
    async def create_contact(self, contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new contact in Zoho CRM"""
        try:
            # Map contact data to Zoho format
            zoho_contact = self._map_contact_to_zoho(contact_data)
            
            response = await self._make_request("POST", "Contacts", data={"data": [zoho_contact]})
            
            if response.get("data") and response["data"][0].get("code") == "SUCCESS":
                return response["data"][0]["details"]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to create contact: {e}")
            return None
    
    async def update_contact(self, contact_id: str, contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing contact in Zoho CRM"""
        try:
            zoho_contact = self._map_contact_to_zoho(contact_data)
            zoho_contact["id"] = contact_id
            
            response = await self._make_request("PUT", f"Contacts/{contact_id}", data={"data": [zoho_contact]})
            
            if response.get("data") and response["data"][0].get("code") == "SUCCESS":
                return response["data"][0]["details"]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to update contact: {e}")
            return None
    
    async def get_deals(self, filters: Optional[Dict[str, Any]] = None, limit: int = 200) -> List[Dict[str, Any]]:
        """Get deals from Zoho CRM"""
        try:
            params = {"per_page": min(limit, 200)}
            
            if filters:
                criteria = self._build_criteria(filters)
                if criteria:
                    params["criteria"] = criteria
            
            response = await self._make_request("GET", "Deals", params=params)
            return response.get("data", [])
            
        except Exception as e:
            logger.error(f"Failed to get deals: {e}")
            return []
    
    async def create_deal(self, deal_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new deal in Zoho CRM"""
        try:
            zoho_deal = self._map_deal_to_zoho(deal_data)
            
            response = await self._make_request("POST", "Deals", data={"data": [zoho_deal]})
            
            if response.get("data") and response["data"][0].get("code") == "SUCCESS":
                return response["data"][0]["details"]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to create deal: {e}")
            return None
    
    async def update_deal(self, deal_id: str, deal_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing deal in Zoho CRM"""
        try:
            zoho_deal = self._map_deal_to_zoho(deal_data)
            zoho_deal["id"] = deal_id
            
            response = await self._make_request("PUT", f"Deals/{deal_id}", data={"data": [zoho_deal]})
            
            if response.get("data") and response["data"][0].get("code") == "SUCCESS":
                return response["data"][0]["details"]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to update deal: {e}")
            return None
    
    async def get_leads(self, filters: Optional[Dict[str, Any]] = None, limit: int = 200) -> List[Dict[str, Any]]:
        """Get leads from Zoho CRM"""
        try:
            params = {"per_page": min(limit, 200)}
            
            if filters:
                criteria = self._build_criteria(filters)
                if criteria:
                    params["criteria"] = criteria
            
            response = await self._make_request("GET", "Leads", params=params)
            return response.get("data", [])
            
        except Exception as e:
            logger.error(f"Failed to get leads: {e}")
            return []
    
    async def create_lead(self, lead_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new lead in Zoho CRM"""
        try:
            zoho_lead = self._map_lead_to_zoho(lead_data)
            
            response = await self._make_request("POST", "Leads", data={"data": [zoho_lead]})
            
            if response.get("data") and response["data"][0].get("code") == "SUCCESS":
                return response["data"][0]["details"]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to create lead: {e}")
            return None
    
    async def search_records(self, module: str, search_criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search records in Zoho CRM"""
        try:
            criteria = self._build_criteria(search_criteria)
            params = {
                "criteria": criteria,
                "per_page": 200
            }
            
            response = await self._make_request("GET", module, params=params)
            return response.get("data", [])
            
        except Exception as e:
            logger.error(f"Failed to search records: {e}")
            return []
    
    # Helper methods for data mapping
    
    def _map_contact_to_zoho(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map internal contact data to Zoho format"""
        zoho_contact = {}
        
        # Map common fields
        field_mapping = {
            "first_name": "First_Name",
            "last_name": "Last_Name",
            "email": "Email",
            "phone": "Phone",
            "company": "Account_Name",
            "title": "Title",
            "source": "Lead_Source",
            "notes": "Description"
        }
        
        for internal_field, zoho_field in field_mapping.items():
            if internal_field in contact_data:
                zoho_contact[zoho_field] = contact_data[internal_field]
        
        return zoho_contact
    
    def _map_deal_to_zoho(self, deal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map internal deal data to Zoho format"""
        zoho_deal = {}
        
        field_mapping = {
            "name": "Deal_Name",
            "amount": "Amount",
            "stage": "Stage",
            "closing_date": "Closing_Date",
            "contact_id": "Contact_Name",
            "description": "Description",
            "probability": "Probability"
        }
        
        for internal_field, zoho_field in field_mapping.items():
            if internal_field in deal_data:
                zoho_deal[zoho_field] = deal_data[internal_field]
        
        return zoho_deal
    
    def _map_lead_to_zoho(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map internal lead data to Zoho format"""
        zoho_lead = {}
        
        field_mapping = {
            "first_name": "First_Name",
            "last_name": "Last_Name",
            "email": "Email",
            "phone": "Phone",
            "company": "Company",
            "source": "Lead_Source",
            "status": "Lead_Status",
            "notes": "Description"
        }
        
        for internal_field, zoho_field in field_mapping.items():
            if internal_field in lead_data:
                zoho_lead[zoho_field] = lead_data[internal_field]
        
        return zoho_lead
    
    def _build_criteria(self, filters: Dict[str, Any]) -> str:
        """Build Zoho search criteria from filters"""
        criteria_parts = []
        
        for field, value in filters.items():
            if isinstance(value, str):
                criteria_parts.append(f"({field}:equals:{value})")
            elif isinstance(value, dict):
                operator = value.get("operator", "equals")
                val = value.get("value")
                if val is not None:
                    criteria_parts.append(f"({field}:{operator}:{val})")
        
        return " and ".join(criteria_parts) if criteria_parts else ""
    
    async def get_status(self) -> Dict[str, Any]:
        """Get integration status"""
        return {
            "name": "zoho_crm",
            "status": "connected" if self.is_initialized else "disconnected",
            "initialized": self.is_initialized,
            "mock_mode": settings.is_mock_mode(),
            "token_valid": self.access_token is not None,
            "token_expires_at": self.token_expires_at.isoformat() if self.token_expires_at else None
        }
    
    async def shutdown(self):
        """Shutdown integration and cleanup resources"""
        try:
            if self.client:
                await self.client.aclose()
            
            self.is_initialized = False
            logger.info("Zoho integration shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during Zoho integration shutdown: {e}")
    
    # Specialized methods for recruiting agent
    
    async def search_candidates(self, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search for candidates based on requirements"""
        try:
            # Search in both Contacts and Leads
            search_filters = {}
            
            if requirements.get("experience_years"):
                search_filters["Experience_Years"] = {
                    "operator": "greater_equal",
                    "value": requirements["experience_years"]
                }
            
            if requirements.get("location"):
                search_filters["City"] = requirements["location"]
            
            # Search contacts
            contacts = await self.search_records("Contacts", search_filters)
            
            # Search leads
            leads = await self.search_records("Leads", search_filters)
            
            # Combine and format results
            candidates = []
            
            for contact in contacts:
                candidates.append({
                    "id": contact.get("id"),
                    "name": f"{contact.get('First_Name', '')} {contact.get('Last_Name', '')}".strip(),
                    "email": contact.get("Email"),
                    "phone": contact.get("Phone"),
                    "source": "contact",
                    "zoho_id": contact.get("id")
                })
            
            for lead in leads:
                candidates.append({
                    "id": lead.get("id"),
                    "name": f"{lead.get('First_Name', '')} {lead.get('Last_Name', '')}".strip(),
                    "email": lead.get("Email"),
                    "phone": lead.get("Phone"),
                    "source": "lead",
                    "zoho_id": lead.get("id")
                })
            
            return candidates
            
        except Exception as e:
            logger.error(f"Failed to search candidates: {e}")
            return [] 
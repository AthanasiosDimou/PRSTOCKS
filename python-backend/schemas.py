# =============================================================================
# PYDANTIC SCHEMAS - API Request/Response Models
# =============================================================================

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# =============================================================================
# USER SCHEMAS
# =============================================================================

class UserCreate(BaseModel):
    username: str
    subteam: str
    category: Optional[str] = "member"
    device: Optional[str] = None

class UserResponse(BaseModel):
    user_id: int
    username: str
    category: str
    subteam: str
    devices: Optional[List[str]] = []
    last_login: Optional[datetime]
    created_at: datetime

class DeviceLogin(BaseModel):
    username: str
    device: str

class UserVerify(BaseModel):
    username: str
    password: str

class AdminVerify(BaseModel):
    admin_password: str

# =============================================================================
# INVENTORY SCHEMAS
# =============================================================================

class InventoryItemCreate(BaseModel):
    part_number: str
    quantity: int
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    subteam: Optional[str] = None
    cost: Optional[float] = 0.0
    vendor: Optional[str] = None
    created_by: Optional[str] = None
    item_type: Optional[str] = None
    systems: Optional[str] = None
    case_code_in: Optional[str] = None
    size: Optional[str] = None
    link: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    part_number: Optional[str] = None
    quantity: Optional[int] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    subteam: Optional[str] = None
    cost: Optional[float] = None
    vendor: Optional[str] = None
    last_updated_by: Optional[str] = None
    item_type: Optional[str] = None
    systems: Optional[str] = None
    case_code_in: Optional[str] = None
    size: Optional[str] = None
    link: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class InventoryItemResponse(BaseModel):
    item_id: int
    part_number: str
    quantity: int
    description: Optional[str]
    category: Optional[str]
    location: Optional[str]
    subteam: Optional[str]
    cost: float
    vendor: Optional[str]
    created_by: Optional[str]
    last_updated_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    item_type: Optional[str]
    systems: Optional[str]
    case_code_in: Optional[str]
    size: Optional[str]
    link: Optional[str]
    company: Optional[str]
    notes: Optional[str]

# =============================================================================
# PREFERENCE SCHEMAS
# =============================================================================

class PreferenceUpdate(BaseModel):
    device_id: str
    preferences: dict
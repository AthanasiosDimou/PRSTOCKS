# =============================================================================
# DATABASE MODELS - SQLAlchemy ORM Models
# =============================================================================

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for device-based authentication and tracking"""
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="member")  # User role category (e.g., "admin", "member") - for access control
    subteam = Column(String, nullable=False)
    devices = Column(Text)  # JSON string of device list
    last_login = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryItem(Base):
    """Inventory item model with user tracking for electrical components"""
    __tablename__ = "inventory_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    description = Column(Text)
    category = Column(String)  # Item category (e.g., "Electronics", "Admin") - for inventory classification
    location = Column(String)
    subteam = Column(String)
    cost = Column(Float, default=0.0)
    vendor = Column(String)
    created_by = Column(String)  # Username who created the item
    last_updated_by = Column(String)  # Username who last updated the item
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional fields for detailed component tracking
    item_type = Column(String)  # Type of component (e.g., "Resistor", "Capacitor")
    systems = Column(String)  # Systems this component is used in
    case_code_in = Column(String)  # Package/case code
    size = Column(String)  # Size specifications
    link = Column(String)  # Link to datasheet or supplier
    company = Column(String)  # Manufacturer company
    notes = Column(Text)  # Additional notes

class UserPreference(Base):
    """User preferences model for per-user theme and settings"""
    __tablename__ = "user_preferences"
    
    username = Column(String, primary_key=True, index=True)
    preferences = Column(Text, nullable=False)  # JSON string of preferences
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
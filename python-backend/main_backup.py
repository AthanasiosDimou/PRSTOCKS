# =============================================================================
# PYTHON FASTAPI BACKEND - SQLAlchemy SQLite File Server
# =============================================================================
# Run with: uvicorn main:app --reload --host 127.0.0.1 --port 8000

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
import json

# =============================================================================
# DATABASE SETUP WITH SQLALCHEMY ORM
# =============================================================================

DB_DIR = "databases"
os.makedirs(DB_DIR, exist_ok=True)

# Create 3 separate SQLite engines and sessions
inventory_engine = create_engine(f"sqlite:///{DB_DIR}/inventory.db", connect_args={"check_same_thread": False})
users_engine = create_engine(f"sqlite:///{DB_DIR}/users.db", connect_args={"check_same_thread": False})
preferences_engine = create_engine(f"sqlite:///{DB_DIR}/preferences.db", connect_args={"check_same_thread": False})

# Separate session makers for each database
InventorySession = sessionmaker(autocommit=False, autoflush=False, bind=inventory_engine)
UsersSession = sessionmaker(autocommit=False, autoflush=False, bind=users_engine)
PreferencesSession = sessionmaker(autocommit=False, autoflush=False, bind=preferences_engine)

Base = declarative_base()

# =============================================================================
# SQLALCHEMY MODELS
# =============================================================================

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, default="member")
    subteam = Column(String, nullable=False)
    devices = Column(Text)  # JSON string of device list
    last_login = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    description = Column(Text)
    category = Column(String)
    location = Column(String)
    subteam = Column(String)
    cost = Column(Float, default=0.0)
    vendor = Column(String)
    created_by = Column(String)  # Username who created the item
    last_updated_by = Column(String)  # Username who last updated the item
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DevicePreference(Base):
    __tablename__ = "device_preferences"
    
    device_id = Column(String, primary_key=True, index=True)
    preferences = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables in separate databases
User.metadata.create_all(bind=users_engine)
InventoryItem.metadata.create_all(bind=inventory_engine)  
DevicePreference.metadata.create_all(bind=preferences_engine)

# =============================================================================
# DEPENDENCY FUNCTIONS FOR DATABASE SESSIONS
# =============================================================================

def get_users_db():
    db = UsersSession()
    try:
        yield db
    finally:
        db.close()

def get_inventory_db():
    db = InventorySession()
    try:
        yield db
    finally:
        db.close()

def get_preferences_db():
    db = PreferencesSession()
    try:
        yield db
    finally:
        db.close()

# =============================================================================
# FASTAPI APP SETUP
# =============================================================================

app = FastAPI(
    title="PRStocks Backend",
    description="SQLAlchemy-powered SQLite backend for cross-device inventory management",
    version="1.0.0"
)

# CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# PYDANTIC MODELS FOR API
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

class InventoryItemCreate(BaseModel):
    part_number: str
    quantity: int
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    subteam: Optional[str] = None
    cost: Optional[float] = 0.0
    vendor: Optional[str] = None

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
    created_at: datetime
    updated_at: datetime

class DeviceLogin(BaseModel):
    username: str
    device: str

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def parse_devices(devices_json: str) -> List[str]:
    """Parse devices JSON string to list"""
    try:
        return json.loads(devices_json) if devices_json else []
    except:
        return []

def add_device_to_user(user_devices: List[str], new_device: str) -> List[str]:
    """Add device to user's device list if not already present"""
    if new_device and new_device not in user_devices:
        user_devices.append(new_device)
    return user_devices

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "PRStocks SQLAlchemy FastAPI Backend",
        "timestamp": datetime.now().isoformat(),
        "database": "SQLite with SQLAlchemy ORM"
    }

# =============================================================================
# USER MANAGEMENT ENDPOINTS
# =============================================================================

@app.get("/api/users")
async def get_all_users(db: Session = Depends(get_users_db)):
    users = db.query(User).all()
    return {
        "success": True,
        "data": [
            {
                "user_id": user.user_id,
                "username": user.username,
                "category": user.category,
                "subteam": user.subteam,
                "devices": parse_devices(user.devices),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }

@app.post("/api/users")
async def create_user(user_data: UserCreate, db: Session = Depends(get_users_db)):
    # Check if username exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Username already exists")
    
    # Create initial device list
    initial_devices = [user_data.device] if user_data.device else []
    
    # Create new user
    db_user = User(
        username=user_data.username,
        category=user_data.category,
        subteam=user_data.subteam,
        devices=json.dumps(initial_devices),
        last_login=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "success": True,
        "data": {
            "userId": db_user.user_id,
            "message": "User created successfully"
        }
    }

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_users_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": "User deleted successfully"}

@app.post("/api/users/login")
async def login_user(login_data: DeviceLogin, db: Session = Depends(get_users_db)):
    """Device-based login to track user activity"""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user's device list and last login
    devices = parse_devices(user.devices)
    devices = add_device_to_user(devices, login_data.device)
    user.devices = json.dumps(devices)
    user.last_login = datetime.utcnow()
    db.commit()
    
    return {
        "success": True, 
        "data": {
            "user_id": user.user_id,
            "username": user.username,
            "category": user.category,
            "subteam": user.subteam
        }
    }

# =============================================================================
# INVENTORY MANAGEMENT ENDPOINTS
# =============================================================================

@app.get("/api/inventory")
async def get_all_inventory(db: Session = Depends(get_inventory_db)):
    items = db.query(InventoryItem).all()
    return {
        "success": True,
        "data": [
            {
                "item_id": item.item_id,
                "part_number": item.part_number,
                "quantity": item.quantity,
                "description": item.description,
                "category": item.category,
                "location": item.location,
                "subteam": item.subteam,
                "cost": item.cost,
                "vendor": item.vendor,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None
            }
            for item in items
        ]
    }

@app.post("/api/inventory")
async def add_inventory_item(item_data: InventoryItemCreate, db: Session = Depends(get_inventory_db)):
    db_item = InventoryItem(**item_data.dict())
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return {
        "success": True,
        "data": {
            "itemId": db_item.item_id,
            "message": "Inventory item added successfully"
        }
    }

@app.put("/api/inventory/{item_id}")
async def update_inventory_item(item_id: int, updates: Dict[str, Any], db: Session = Depends(get_inventory_db)):
    item = db.query(InventoryItem).filter(InventoryItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update fields
    for key, value in updates.items():
        if hasattr(item, key):
            setattr(item, key, value)
    
    item.updated_at = datetime.utcnow()
    db.commit()
    
    return {"success": True, "message": "Inventory item updated successfully"}

@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(item_id: int, db: Session = Depends(get_inventory_db)):
    item = db.query(InventoryItem).filter(InventoryItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    
    return {"success": True, "message": "Inventory item deleted successfully"}

@app.get("/api/inventory/stats")
async def get_inventory_stats(db: Session = Depends(get_inventory_db)):
    total_items = db.query(InventoryItem).count()
    total_quantity = db.query(InventoryItem).with_entities(
        db.query(InventoryItem.quantity).filter(InventoryItem.quantity.isnot(None)).all()
    )
    total_quantity = sum(item.quantity for item in db.query(InventoryItem).all() if item.quantity)
    total_value = sum((item.cost or 0) * (item.quantity or 0) for item in db.query(InventoryItem).all())
    
    return {
        "success": True,
        "data": {
            "totalItems": total_items,
            "totalQuantity": total_quantity,
            "totalValue": round(total_value, 2)
        }
    }

# =============================================================================
# PREFERENCES MANAGEMENT
# =============================================================================

@app.get("/api/preferences/{device_id}")
async def get_device_preferences(device_id: str, db: Session = Depends(get_preferences_db)):
    pref = db.query(DevicePreference).filter(DevicePreference.device_id == device_id).first()
    
    if pref:
        preferences = json.loads(pref.preferences)
    else:
        preferences = {}
    
    return {"success": True, "data": preferences}

@app.post("/api/preferences/{device_id}")
async def save_device_preferences(device_id: str, preferences: Dict[str, Any], db: Session = Depends(get_preferences_db)):
    pref = db.query(DevicePreference).filter(DevicePreference.device_id == device_id).first()
    
    preferences_json = json.dumps(preferences)
    
    if pref:
        pref.preferences = preferences_json
        pref.updated_at = datetime.utcnow()
    else:
        pref = DevicePreference(device_id=device_id, preferences=preferences_json)
        db.add(pref)
    
    db.commit()
    return {"success": True, "message": "Preferences saved successfully"}

# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@app.post("/api/admin/clear-data")
async def clear_all_data():
    # Clear data from all 3 databases
    users_db = UsersSession()
    inventory_db = InventorySession()
    preferences_db = PreferencesSession()
    
    try:
        users_db.query(User).delete()
        users_db.commit()
        
        inventory_db.query(InventoryItem).delete()
        inventory_db.commit()
        
        preferences_db.query(DevicePreference).delete()
        preferences_db.commit()
        
        return {"success": True, "message": "All data cleared successfully"}
    finally:
        users_db.close()
        inventory_db.close()
        preferences_db.close()

@app.get("/api/admin/database-info")
async def get_database_info():
    users_db = UsersSession()
    inventory_db = InventorySession()
    preferences_db = PreferencesSession()
    
    try:
        user_count = users_db.query(User).count()
        inventory_count = inventory_db.query(InventoryItem).count()
        device_count = preferences_db.query(DevicePreference).count()
        
        return {
            "success": True,
            "data": {
                "timestamp": datetime.now().isoformat(),
                "userCount": user_count,
                "inventoryCount": inventory_count,
                "deviceCount": device_count,
                "databases": ["inventory.db", "users.db", "preferences.db"],
                "database": "3 separate SQLite files with SQLAlchemy ORM"
            }
        }
    finally:
        users_db.close()
        inventory_db.close()
        preferences_db.close()

# =============================================================================
# STARTUP MESSAGE
# =============================================================================

@app.on_event("startup")
async def startup_event():
    print("🐍 ================================")
    print("🐍 PRStocks SQLAlchemy Backend Started!")
    print("🐍 ================================")
    print("📡 Server: http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    print("🗂️ Database Architecture (3 separate files):")
    print("   📦 ./databases/inventory.db - Stock & Products")
    print("   👥 ./databases/users.db - User Accounts") 
    print("   ⚙️  ./databases/preferences.db - Device Settings")
    print("🔄 SQLAlchemy ORM with auto-migration")
    print("🌟 Ready for cross-device inventory!")
    print("🐍 ================================")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

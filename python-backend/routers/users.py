# =============================================================================
# USER MANAGEMENT ROUTES - Device-based user tracking and management
# =============================================================================

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import json

from models import User
from schemas import UserCreate, DeviceLogin, UserVerify, AdminVerify
from database import get_users_db
from utils import parse_devices, add_device_to_user, format_user_response

router = APIRouter(prefix="/api/users", tags=["users"])

# =============================================================================
# USER ENDPOINTS
# =============================================================================

@router.get("")
async def get_all_users(db: Session = Depends(get_users_db)):
    """Get all users with their device information"""
    users = db.query(User).all()
    return {
        "success": True,
        "data": [format_user_response(user) for user in users]
    }

@router.post("")
async def create_user(user_data: UserCreate, db: Session = Depends(get_users_db)):
    """Create a new user with optional initial device"""
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

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_users_db)):
    """Delete a user by ID"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": "User deleted successfully"}

@router.post("/login")
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

@router.post("/verify")
async def verify_user_password(verify_data: UserVerify, db: Session = Depends(get_users_db)):
    """Verify user password - simplified version without actual password storage"""
    user = db.query(User).filter(User.username == verify_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # For now, return success if user exists (no password storage implemented)
    # In a real implementation, you'd hash and compare passwords
    return {
        "success": True,
        "data": {"valid": True}
    }

@router.post("/admin/verify")
async def verify_admin_password(verify_data: AdminVerify):
    """Verify admin password - hardcoded for now"""

    # For development - use a hardcoded admin password
    # In production, this should be properly secured and hashed
    ADMIN_PASSWORD = "Password"  # Might do it in the future, obfsucation or encryption for the password, though for a local server, not necessary.


    received_password = verify_data.admin_password
    
    # Debug logging to see exactly what we receive
    print(f"🔐 Backend: Received password: '{received_password}'")
    print(f"🔐 Backend: Expected password: '{ADMIN_PASSWORD}'")
    print(f"🔐 Backend: Received length: {len(received_password)}")
    print(f"🔐 Backend: Expected length: {len(ADMIN_PASSWORD)}")
    print(f"🔐 Backend: Received bytes: {[ord(c) for c in received_password]}")
    print(f"🔐 Backend: Expected bytes: {[ord(c) for c in ADMIN_PASSWORD]}")
    print(f"🔐 Backend: Passwords equal: {received_password == ADMIN_PASSWORD}")
    print(f"🔐 Backend: Trimmed equal: {received_password.strip() == ADMIN_PASSWORD.strip()}")
    
    if received_password.strip() == ADMIN_PASSWORD.strip():
        return {
            "success": True,
            "verified": True,
            "message": "Admin verification successful"
        }
    else:
        return {
            "success": False,
            "verified": False,
            "message": f"Invalid admin password. Received: '{received_password}' (len: {len(received_password)})"
        }
# =============================================================================
# PREFERENCES ROUTES - Per-device theme and settings management
# =============================================================================

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import json

from models import UserPreference
from schemas import PreferenceUpdate
from database import get_preferences_db

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

# =============================================================================
# PREFERENCE ENDPOINTS
# =============================================================================

@router.get("/{device_id}")
async def get_device_preferences(device_id: str, db: Session = Depends(get_preferences_db)):
    """Get preferences for a specific device (legacy endpoint)"""
    # For backward compatibility, treat device_id as username
    return await get_user_preferences(device_id, db)

@router.get("/user/{username}")
async def get_user_preferences(username: str, db: Session = Depends(get_preferences_db)):
    """Get preferences for a specific user"""
    preference = db.query(UserPreference).filter(UserPreference.username == username).first()
    
    if not preference:
        return {
            "success": True,
            "data": {
                "username": username,
                "preferences": {}
            }
        }
    
    try:
        preferences_data = json.loads(preference.preferences)
    except:
        preferences_data = {}
    
    return {
        "success": True,
        "data": {
            "username": username,
            "preferences": preferences_data,
            "updated_at": preference.updated_at.isoformat()
        }
    }

@router.put("/{device_id}")
async def update_device_preferences(device_id: str, preference_data: PreferenceUpdate, db: Session = Depends(get_preferences_db)):
    """Update preferences for a specific device (legacy endpoint)"""
    # For backward compatibility, treat device_id as username
    return await update_user_preferences(device_id, preference_data, db)

@router.post("/user/{username}")
async def update_user_preferences(username: str, preference_data: PreferenceUpdate, db: Session = Depends(get_preferences_db)):
    """Update preferences for a specific user"""
    preference = db.query(UserPreference).filter(UserPreference.username == username).first()
    
    preferences_json = json.dumps(preference_data.preferences)
    
    if preference:
        # Update existing preference
        preference.preferences = preferences_json
        db.commit()
    else:
        # Create new preference
        preference = UserPreference(
            username=username,
            preferences=preferences_json
        )
        db.add(preference)
        db.commit()
    
    return {
        "success": True,
        "message": f"Preferences updated for user {username}"
    }

@router.delete("/{device_id}")
async def delete_device_preferences(device_id: str, db: Session = Depends(get_preferences_db)):
    """Delete preferences for a specific device (legacy endpoint)"""
    # For backward compatibility, treat device_id as username
    return await delete_user_preferences(device_id, db)

@router.delete("/user/{username}")
async def delete_user_preferences(username: str, db: Session = Depends(get_preferences_db)):
    """Delete preferences for a specific user"""
    preference = db.query(UserPreference).filter(UserPreference.username == username).first()
    
    if not preference:
        raise HTTPException(status_code=404, detail="User preferences not found")
    
    db.delete(preference)
    db.commit()
    
    return {
        "success": True,
        "message": f"Preferences deleted for user {username}"
    }

@router.get("")
async def get_all_device_preferences(db: Session = Depends(get_preferences_db)):
    """Get preferences for all devices (admin only, legacy endpoint)"""
    return await get_all_user_preferences(db)

@router.get("/users")
async def get_all_user_preferences(db: Session = Depends(get_preferences_db)):
    """Get preferences for all users (admin only)"""
    preferences = db.query(UserPreference).all()
    
    result = []
    for pref in preferences:
        try:
            preferences_data = json.loads(pref.preferences)
        except:
            preferences_data = {}
        
        result.append({
            "username": pref.username,
            "preferences": preferences_data,
            "updated_at": pref.updated_at.isoformat()
        })
    
    return {
        "success": True,
        "data": result
    }
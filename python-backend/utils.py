# =============================================================================
# UTILITY FUNCTIONS - Helper functions for device and user management
# =============================================================================

import json
from typing import List
from datetime import datetime

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

def format_user_response(user) -> dict:
    """Format user object for API response"""
    return {
        "user_id": user.user_id,
        "username": user.username,
        "category": user.category,
        "subteam": user.subteam,
        "devices": parse_devices(user.devices),
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "created_at": user.created_at.isoformat()
    }

def format_inventory_response(item) -> dict:
    """Format inventory item for API response"""
    return {
        "item_id": item.item_id,
        "part_number": item.part_number,
        "quantity": item.quantity,
        "description": item.description,
        "category": item.category,
        "location": item.location,
        "subteam": item.subteam,
        "cost": item.cost,
        "vendor": item.vendor,
        "created_by": item.created_by,
        "last_updated_by": item.last_updated_by,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        "date_time_added": item.created_at.isoformat() if item.created_at else None,
        "item_type": item.item_type,
        "systems": item.systems,
        "case_code_in": item.case_code_in,
        "size": item.size,
        "link": item.link,
        "company": item.company,
        "notes": item.notes
    }
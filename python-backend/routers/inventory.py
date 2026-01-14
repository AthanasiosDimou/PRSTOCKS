# =============================================================================
# INVENTORY MANAGEMENT ROUTES - Electrical component tracking with user history
# =============================================================================

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any

from models import InventoryItem
from schemas import InventoryItemCreate, InventoryItemUpdate
from database import get_inventory_db
from utils import format_inventory_response

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# =============================================================================
# INVENTORY ENDPOINTS
# =============================================================================

@router.get("")
async def get_all_inventory(db: Session = Depends(get_inventory_db)):
    """Get all inventory items with user tracking information"""
    items = db.query(InventoryItem).all()
    return {
        "success": True,
        "data": [format_inventory_response(item) for item in items]
    }

@router.post("")
async def create_inventory_item(item_data: InventoryItemCreate, db: Session = Depends(get_inventory_db)):
    """Create a new inventory item or accumulate quantity if part number exists"""
    
    # Check if item with same part number already exists
    existing_item = db.query(InventoryItem).filter(InventoryItem.part_number == item_data.part_number).first()
    
    if existing_item:
        # Accumulate quantity
        if item_data.quantity != 0:
            existing_item.quantity += item_data.quantity
        
        # Merge other fields if they contain new information
        def merge_field(existing_value, new_value):
            """Merge field values, appending with comma if different"""
            if not new_value or not new_value.strip():
                return existing_value
            new_value = new_value.strip()
            if not existing_value or not existing_value.strip():
                return new_value
            existing_value = existing_value.strip()
            # Don't duplicate if already contains the value
            if new_value.lower() not in existing_value.lower():
                return f"{existing_value}, {new_value}"
            return existing_value
        
        # Update fields if provided and different
        if item_data.description:
            existing_item.description = merge_field(existing_item.description, item_data.description)
        if item_data.category:
            existing_item.category = merge_field(existing_item.category, item_data.category)
        if item_data.location:
            existing_item.location = merge_field(existing_item.location, item_data.location)
        if item_data.subteam:
            existing_item.subteam = merge_field(existing_item.subteam, item_data.subteam)
        if item_data.vendor:
            existing_item.vendor = merge_field(existing_item.vendor, item_data.vendor)
        if item_data.item_type:
            existing_item.item_type = merge_field(existing_item.item_type, item_data.item_type)
        if item_data.systems:
            existing_item.systems = merge_field(existing_item.systems, item_data.systems)
        if item_data.case_code_in:
            existing_item.case_code_in = merge_field(existing_item.case_code_in, item_data.case_code_in)
        if item_data.size:
            existing_item.size = merge_field(existing_item.size, item_data.size)
        if item_data.link:
            existing_item.link = merge_field(existing_item.link, item_data.link)
        if item_data.company:
            existing_item.company = merge_field(existing_item.company, item_data.company)
        if item_data.notes:
            existing_item.notes = merge_field(existing_item.notes, item_data.notes)
        
        # Update cost if provided
        if item_data.cost is not None:
            existing_item.cost = item_data.cost
            
        # Update last_updated_by if provided
        if item_data.created_by:
            existing_item.last_updated_by = item_data.created_by
            
        existing_item.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "data": {
                "itemId": existing_item.item_id,
                "message": f"Updated existing item {item_data.part_number}, new quantity: {existing_item.quantity}"
            }
        }
    else:
        # Create new item
        db_item = InventoryItem(
            part_number=item_data.part_number,
            quantity=item_data.quantity,
            description=item_data.description,
            category=item_data.category,
            location=item_data.location,
            subteam=item_data.subteam,
            cost=item_data.cost,
            vendor=item_data.vendor,
            created_by=item_data.created_by,
            last_updated_by=item_data.created_by,
            item_type=item_data.item_type,
            systems=item_data.systems,
            case_code_in=item_data.case_code_in,
            size=item_data.size,
            link=item_data.link,
            company=item_data.company,
            notes=item_data.notes
        )
        
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        return {
            "success": True,
            "data": {
                "itemId": db_item.item_id,
                "message": "Inventory item created successfully"
            }
        }

@router.put("/{item_id}")
async def update_inventory_item(item_id: int, item_data: InventoryItemUpdate, db: Session = Depends(get_inventory_db)):
    """Update an inventory item with user tracking"""
    item = db.query(InventoryItem).filter(InventoryItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update fields if provided
    for field, value in item_data.dict(exclude_unset=True).items():
        if hasattr(item, field):
            setattr(item, field, value)
    
    item.updated_at = datetime.utcnow()
    db.commit()
    
    return {"success": True, "message": "Inventory item updated successfully"}

@router.delete("/{item_id}")
async def delete_inventory_item(item_id: int, db: Session = Depends(get_inventory_db)):
    """Delete an inventory item"""
    item = db.query(InventoryItem).filter(InventoryItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    
    return {"success": True, "message": "Inventory item deleted successfully"}

@router.get("/statistics")
async def get_inventory_statistics(db: Session = Depends(get_inventory_db)):
    """Get inventory statistics and summaries"""
    items = db.query(InventoryItem).all()
    
    total_items = len(items)
    total_quantity = sum(item.quantity for item in items)
    
    # Group by category
    categories = {}
    for item in items:
        category = item.category or "Uncategorized"
        if category not in categories:
            categories[category] = 0
        categories[category] += item.quantity
    
    # Group by subteam
    subteams = {}
    for item in items:
        subteam = item.subteam or "Unassigned"
        if subteam not in subteams:
            subteams[subteam] = 0
        subteams[subteam] += item.quantity
    
    return {
        "success": True,
        "data": {
            "totalItems": total_items,
            "totalQuantity": total_quantity,
            "categories": categories,
            "subteams": subteams,
            "uniquePartNumbers": len(set(item.part_number for item in items))
        }
    }

@router.get("/search")
async def search_inventory(
    q: str,
    category: str = None,
    subteam: str = None,
    db: Session = Depends(get_inventory_db)
):
    """Search inventory items by various criteria"""
    query = db.query(InventoryItem)
    
    if q:
        query = query.filter(
            (InventoryItem.part_number.contains(q)) |
            (InventoryItem.description.contains(q)) |
            (InventoryItem.vendor.contains(q))
        )
    
    if category:
        query = query.filter(InventoryItem.category == category)
    
    if subteam:
        query = query.filter(InventoryItem.subteam == subteam)
    
    items = query.all()
    
    return {
        "success": True,
        "data": [format_inventory_response(item) for item in items]
    }
# =============================================================================
# DATABASE CONFIGURATION - SQLAlchemy Setup and Sessions
# =============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from models import Base, User, InventoryItem, UserPreference

# =============================================================================
# DATABASE SETUP
# =============================================================================

DB_DIR = "databases"
os.makedirs(DB_DIR, exist_ok=True)

# Create 3 separate SQLite engines for different purposes
inventory_engine = create_engine(f"sqlite:///{DB_DIR}/inventory.db", connect_args={"check_same_thread": False})
users_engine = create_engine(f"sqlite:///{DB_DIR}/users.db", connect_args={"check_same_thread": False})
preferences_engine = create_engine(f"sqlite:///{DB_DIR}/preferences.db", connect_args={"check_same_thread": False})

# Separate session makers for each database
InventorySession = sessionmaker(autocommit=False, autoflush=False, bind=inventory_engine)
UsersSession = sessionmaker(autocommit=False, autoflush=False, bind=users_engine)
PreferencesSession = sessionmaker(autocommit=False, autoflush=False, bind=preferences_engine)

# =============================================================================
# CREATE TABLES
# =============================================================================

def create_tables():
    """Create all tables in their respective databases"""
    User.metadata.create_all(bind=users_engine)
    InventoryItem.metadata.create_all(bind=inventory_engine)  
    UserPreference.metadata.create_all(bind=preferences_engine)
    print("✅ Database tables created/verified")

# =============================================================================
# DEPENDENCY FUNCTIONS FOR DATABASE SESSIONS
# =============================================================================

def get_users_db() -> Generator[Session, None, None]:
    """Get users database session"""
    db = UsersSession()
    try:
        yield db
    finally:
        db.close()

def get_inventory_db() -> Generator[Session, None, None]:
    """Get inventory database session"""
    db = InventorySession()
    try:
        yield db
    finally:
        db.close()

def get_preferences_db() -> Generator[Session, None, None]:
    """Get preferences database session"""
    db = PreferencesSession()
    try:
        yield db
    finally:
        db.close()
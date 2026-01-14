# =============================================================================
# PRSTOCKS FASTAPI BACKEND - Modular SQLAlchemy SQLite Server
# =============================================================================
# Run with: uvicorn main:app --reload --host 127.0.0.1 --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import our modular components
from database import create_tables
from routers import users, inventory, preferences

# =============================================================================
# FASTAPI APPLICATION SETUP
# =============================================================================

app = FastAPI(
    title="PRStocks Backend API",
    description="Modular inventory management system with device-based user tracking",
    version="2.0.0"
)

# CORS middleware for cross-origin requests (frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development - replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# INCLUDE ROUTERS
# =============================================================================

app.include_router(users.router)
app.include_router(inventory.router)  
app.include_router(preferences.router)

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "PRStocks Modular FastAPI Backend",
        "timestamp": datetime.now().isoformat(),
        "database": "SQLite with SQLAlchemy ORM",
        "version": "2.0.0"
    }

# =============================================================================
# STARTUP EVENT
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        create_tables()
        print("🚀 PRStocks Backend Started!")
        print("📊 Modular architecture with separate databases:")
        print("   📦 ./databases/inventory.db - Electrical Items")
        print("   👥 ./databases/users.db - Device-based Users") 
        print("   ⚙️  ./databases/preferences.db - Device Settings")
        print("🔄 SQLAlchemy ORM with auto-migration")
        print("🌟 Ready for cross-device inventory!")
        print("🐍 ================================")
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        import traceback
        traceback.print_exc()
        raise

# =============================================================================
# APPLICATION RUNNER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Check if SSL certificates exist
    base_dir = os.path.dirname(__file__)
    cert_file = os.path.join(base_dir, "cert.pem")
    key_file = os.path.join(base_dir, "key.pem")
    
    ssl_enabled = os.path.exists(cert_file) and os.path.exists(key_file)
    
    if ssl_enabled:
        print("🔒 Starting server with HTTPS enabled")
        print(f"📁 Using certificates:")
        print(f"   - {cert_file}")
        print(f"   - {key_file}")
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000,
            ssl_keyfile=key_file,
            ssl_certfile=cert_file
        )
    else:
        print("⚠️  SSL certificates not found, starting with HTTP only")
        print("💡 To enable HTTPS, run: cd python-backend && ./generate-ssl-cert.sh")
        uvicorn.run(app, host="0.0.0.0", port=8000)
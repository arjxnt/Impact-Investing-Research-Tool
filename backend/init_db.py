"""
Database initialization script
Creates all tables in the database
"""

from database import Base, engine
from models import (
    Investment, ClimateRisk, GHGEmissions, SocialImpact, ESGScore,
    PeerBenchmark, ImpactAttribution, PortfolioOptimization,
    CorrelationAnalysis, MonteCarloSimulation
)
from collaboration_models import (
    User, Comment, Task, AuditLog, VersionHistory
)
import sys

def init_database():
    """Create all database tables"""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] Database tables created successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error creating database tables: {e}")
        return False

def drop_database():
    """Drop all database tables (use with caution!)"""
    confirm = input("[WARNING] This will delete all data. Type 'yes' to confirm: ")
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return False
    
    print("Dropping database tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("[SUCCESS] Database tables dropped successfully!")
        return True
    except Exception as e:
        print(f"[ERROR] Error dropping database tables: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        drop_database()
    else:
        init_database()


"""
Database configuration and session management
Supports both SQLite (development) and PostgreSQL (production)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Get database URL from environment variable, default to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./impact_investing.db"
)

# Determine if we're using PostgreSQL
USE_POSTGRES = DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgresql+psycopg2://")

if USE_POSTGRES:
    # PostgreSQL configuration
    # Parse DATABASE_URL or construct from individual components
    if not DATABASE_URL.startswith("postgresql"):
        # Construct from individual environment variables if DATABASE_URL not set
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "impact_investing")
        DATABASE_URL = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Ensure we're using psycopg2 driver
    if not DATABASE_URL.startswith("postgresql+psycopg2"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
    
    # PostgreSQL engine configuration
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,  # Use NullPool for serverless/serverless-like deployments
        pool_pre_ping=True,  # Verify connections before using
        echo=os.getenv("SQL_ECHO", "False").lower() == "true"  # Log SQL queries if enabled
    )
else:
    # SQLite configuration (development)
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=os.getenv("SQL_ECHO", "False").lower() == "true"
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


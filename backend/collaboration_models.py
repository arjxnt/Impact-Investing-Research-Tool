"""
Collaboration & Workflow Models
User authentication, comments, tasks, audit log, and version history
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    """User roles for authorization"""
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200))
    role = Column(String(50), default=UserRole.VIEWER.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="assigned_to_user", foreign_keys="Task.assigned_to_id", cascade="all, delete-orphan")
    created_tasks = relationship("Task", back_populates="created_by_user", foreign_keys="Task.created_by_id", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Comment(Base):
    """Comments on investments and assessments"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # investment, climate_risk, esg_score, emissions, social_impact
    entity_id = Column(Integer, nullable=False, index=True)  # ID of the investment/assessment
    comment_text = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs public comments
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="comments")


class TaskStatus(str, enum.Enum):
    """Task status options"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(Base):
    """Task management for investment-related action items"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=True, index=True)
    entity_type = Column(String(50), index=True)  # investment, climate_risk, esg_score, etc.
    entity_id = Column(Integer, index=True)  # Related entity ID
    
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    status = Column(String(50), default=TaskStatus.PENDING.value, index=True)
    priority = Column(String(50), default=TaskPriority.MEDIUM.value, index=True)
    due_date = Column(DateTime(timezone=True), index=True)
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    investment = relationship("Investment", foreign_keys=[investment_id])
    assigned_to_user = relationship("User", foreign_keys=[assigned_to_id], back_populates="tasks")
    created_by_user = relationship("User", foreign_keys=[created_by_id], back_populates="created_tasks")


class AuditLog(Base):
    """Audit log for tracking all data changes"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)  # create, update, delete, view
    entity_type = Column(String(50), nullable=False, index=True)  # investment, climate_risk, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    
    old_values = Column(JSON)  # Previous values before change
    new_values = Column(JSON)  # New values after change
    changed_fields = Column(JSON)  # List of fields that changed
    
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(String(500))
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


class VersionHistory(Base):
    """Version history for assessments and investments"""
    __tablename__ = "version_history"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # investment, climate_risk, esg_score, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    version_number = Column(Integer, nullable=False, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False)  # create, update, restore
    
    # Store the full entity data as JSON
    entity_data = Column(JSON, nullable=False)
    
    # Metadata
    change_summary = Column(Text)  # Human-readable summary of changes
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User")


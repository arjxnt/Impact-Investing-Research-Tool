"""
Collaboration & Workflow Schemas
Pydantic models for user authentication, comments, tasks, audit log, and version history
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# ==================== User Schemas ====================

class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = UserRole.VIEWER.value
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== Comment Schemas ====================

class CommentBase(BaseModel):
    entity_type: str
    entity_id: int
    comment_text: str
    is_internal: bool = False


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    comment_text: Optional[str] = None
    is_internal: Optional[bool] = None


class CommentResponse(CommentBase):
    id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Task Schemas ====================

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    investment_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    status: str = TaskStatus.PENDING.value
    priority: str = TaskPriority.MEDIUM.value
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: int
    created_by_id: int
    created_by_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    investment_name: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Audit Log Schemas ====================

class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: int
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    changed_fields: Optional[List[str]] = None


class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ==================== Version History Schemas ====================

class VersionHistoryBase(BaseModel):
    entity_type: str
    entity_id: int
    version_number: int
    entity_data: Dict[str, Any]
    change_summary: Optional[str] = None


class VersionHistoryCreate(VersionHistoryBase):
    action: str


class VersionHistoryResponse(VersionHistoryBase):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    created_at: datetime

    class Config:
        from_attributes = True


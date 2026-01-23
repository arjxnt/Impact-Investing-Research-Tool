"""
Collaboration & Workflow Services
Business logic for users, comments, tasks, audit log, and version history
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional, Dict, Any
from datetime import datetime
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

from collaboration_models import User, Comment, Task, AuditLog, VersionHistory, UserRole, TaskStatus, TaskPriority
from collaboration_schemas import (
    UserCreate, UserUpdate, UserLogin,
    CommentCreate, CommentUpdate,
    TaskCreate, TaskUpdate,
    VersionHistoryCreate
)
from models import Investment

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days


# ==================== User Service ====================

class UserService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Create a new user"""
        hashed_password = UserService.hash_password(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users"""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update a user"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = UserService.hash_password(update_data.pop("password"))
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user"""
        user = UserService.get_user_by_username(db, username)
        if not user:
            return None
        if not UserService.verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt


# ==================== Comment Service ====================

class CommentService:
    @staticmethod
    def create_comment(db: Session, comment: CommentCreate, user_id: int) -> Comment:
        """Create a new comment"""
        db_comment = Comment(
            user_id=user_id,
            entity_type=comment.entity_type,
            entity_id=comment.entity_id,
            comment_text=comment.comment_text,
            is_internal=comment.is_internal
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment
    
    @staticmethod
    def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
        """Get a comment by ID"""
        return db.query(Comment).filter(Comment.id == comment_id).first()
    
    @staticmethod
    def get_comments(
        db: Session,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Comment]:
        """Get comments with optional filtering"""
        query = db.query(Comment)
        if entity_type:
            query = query.filter(Comment.entity_type == entity_type)
        if entity_id:
            query = query.filter(Comment.entity_id == entity_id)
        return query.order_by(desc(Comment.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_comment(db: Session, comment_id: int, comment_update: CommentUpdate, user_id: int) -> Optional[Comment]:
        """Update a comment (only by owner)"""
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not db_comment or db_comment.user_id != user_id:
            return None
        
        update_data = comment_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_comment, key, value)
        
        db.commit()
        db.refresh(db_comment)
        return db_comment
    
    @staticmethod
    def delete_comment(db: Session, comment_id: int, user_id: int, is_admin: bool = False) -> bool:
        """Delete a comment (only by owner or admin)"""
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not db_comment:
            return False
        if not is_admin and db_comment.user_id != user_id:
            return False
        
        db.delete(db_comment)
        db.commit()
        return True


# ==================== Task Service ====================

class TaskService:
    @staticmethod
    def create_task(db: Session, task: TaskCreate, created_by_id: int) -> Task:
        """Create a new task"""
        db_task = Task(
            title=task.title,
            description=task.description,
            investment_id=task.investment_id,
            entity_type=task.entity_type,
            entity_id=task.entity_id,
            assigned_to_id=task.assigned_to_id,
            created_by_id=created_by_id,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    
    @staticmethod
    def get_task(db: Session, task_id: int) -> Optional[Task]:
        """Get a task by ID"""
        return db.query(Task).filter(Task.id == task_id).first()
    
    @staticmethod
    def get_tasks(
        db: Session,
        investment_id: Optional[int] = None,
        assigned_to_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get tasks with optional filtering"""
        query = db.query(Task)
        if investment_id:
            query = query.filter(Task.investment_id == investment_id)
        if assigned_to_id:
            query = query.filter(Task.assigned_to_id == assigned_to_id)
        if status:
            query = query.filter(Task.status == status)
        return query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_task(db: Session, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            return None
        
        update_data = task_update.dict(exclude_unset=True)
        if "status" in update_data and update_data["status"] == TaskStatus.COMPLETED.value:
            update_data["completed_at"] = datetime.utcnow()
        elif "status" in update_data and update_data["status"] != TaskStatus.COMPLETED.value:
            update_data["completed_at"] = None
        
        for key, value in update_data.items():
            setattr(db_task, key, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task
    
    @staticmethod
    def delete_task(db: Session, task_id: int) -> bool:
        """Delete a task"""
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            return False
        db.delete(db_task)
        db.commit()
        return True


# ==================== Audit Log Service ====================

class AuditLogService:
    @staticmethod
    def create_audit_log(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: int,
        user_id: Optional[int] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        """Create an audit log entry"""
        # Calculate changed fields
        changed_fields = []
        if old_values and new_values:
            all_keys = set(old_values.keys()) | set(new_values.keys())
            for key in all_keys:
                old_val = old_values.get(key)
                new_val = new_values.get(key)
                if old_val != new_val:
                    changed_fields.append(key)
        
        db_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            changed_fields=changed_fields if changed_fields else None,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    
    @staticmethod
    def get_audit_logs(
        db: Session,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        action: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs with optional filtering"""
        query = db.query(AuditLog)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if entity_id:
            query = query.filter(AuditLog.entity_id == entity_id)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        return query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()


# ==================== Version History Service ====================

class VersionHistoryService:
    @staticmethod
    def create_version(
        db: Session,
        entity_type: str,
        entity_id: int,
        entity_data: Dict[str, Any],
        user_id: Optional[int] = None,
        action: str = "update",
        change_summary: Optional[str] = None
    ) -> VersionHistory:
        """Create a version history entry"""
        # Get the current max version number for this entity
        max_version = db.query(VersionHistory).filter(
            and_(
                VersionHistory.entity_type == entity_type,
                VersionHistory.entity_id == entity_id
            )
        ).order_by(desc(VersionHistory.version_number)).first()
        
        next_version = (max_version.version_number + 1) if max_version else 1
        
        db_version = VersionHistory(
            entity_type=entity_type,
            entity_id=entity_id,
            version_number=next_version,
            entity_data=entity_data,
            user_id=user_id,
            action=action,
            change_summary=change_summary
        )
        db.add(db_version)
        db.commit()
        db.refresh(db_version)
        return db_version
    
    @staticmethod
    def get_versions(
        db: Session,
        entity_type: str,
        entity_id: int,
        limit: int = 50
    ) -> List[VersionHistory]:
        """Get version history for an entity"""
        return db.query(VersionHistory).filter(
            and_(
                VersionHistory.entity_type == entity_type,
                VersionHistory.entity_id == entity_id
            )
        ).order_by(desc(VersionHistory.version_number)).limit(limit).all()
    
    @staticmethod
    def get_version(db: Session, version_id: int) -> Optional[VersionHistory]:
        """Get a specific version by ID"""
        return db.query(VersionHistory).filter(VersionHistory.id == version_id).first()
    
    @staticmethod
    def restore_version(db: Session, version_id: int) -> Optional[Dict[str, Any]]:
        """Get entity data from a version (for restoration)"""
        version = VersionHistoryService.get_version(db, version_id)
        if not version:
            return None
        return version.entity_data


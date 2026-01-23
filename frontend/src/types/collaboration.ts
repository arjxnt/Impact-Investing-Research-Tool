/**
 * Collaboration & Workflow Type Definitions
 */

export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  role: 'admin' | 'analyst' | 'viewer'
  is_active: boolean
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface UserCreate {
  email: string
  username: string
  password: string
  full_name?: string
  role?: string
  is_active?: boolean
}

export interface UserLogin {
  username: string
  password: string
}

export interface Token {
  access_token: string
  token_type: string
  user: User
}

export interface Comment {
  id: number
  user_id: number
  user_name?: string
  entity_type: string
  entity_id: number
  comment_text: string
  is_internal: boolean
  created_at: string
  updated_at?: string
}

export interface CommentCreate {
  entity_type: string
  entity_id: number
  comment_text: string
  is_internal?: boolean
}

export interface Task {
  id: number
  title: string
  description?: string
  investment_id?: number
  investment_name?: string
  entity_type?: string
  entity_id?: number
  assigned_to_id?: number
  assigned_to_name?: string
  created_by_id: number
  created_by_name?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at?: string
}

export interface TaskCreate {
  title: string
  description?: string
  investment_id?: number
  entity_type?: string
  entity_id?: number
  assigned_to_id?: number
  status?: string
  priority?: string
  due_date?: string
}

export interface AuditLog {
  id: number
  user_id?: number
  user_name?: string
  action: string
  entity_type: string
  entity_id: number
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  changed_fields?: string[]
  ip_address?: string
  timestamp: string
}

export interface VersionHistory {
  id: number
  entity_type: string
  entity_id: number
  version_number: number
  entity_data: Record<string, any>
  change_summary?: string
  user_id?: number
  user_name?: string
  action: string
  created_at: string
}


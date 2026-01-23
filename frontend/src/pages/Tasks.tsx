/**
 * Tasks Management Page
 */
import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../components/AuthContext'
import { Task, TaskCreate, User } from '../types/collaboration'
import { CheckSquare, Plus, Filter, Calendar, User as UserIcon, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Tasks() {
  const { user, isAuthenticated } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
      fetchUsers()
    }
  }, [isAuthenticated, filterStatus, filterPriority])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterStatus !== 'all') params.status = filterStatus
      const response = await api.get('/tasks', { params })
      setTasks(response.data || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task status')
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500">Please log in to view and manage tasks.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage action items and track progress across your portfolio
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your filters.'
              : 'Get started by creating a new task.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <li key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.assigned_to_name && (
                        <span className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {task.assigned_to_name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                        </span>
                      )}
                      <span>
                        Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`border rounded-md px-3 py-1 text-sm ${getStatusColor(task.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Task Modal - Simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create New Task</h2>
              <p className="text-sm text-gray-500 mb-4">
                Task creation form would go here. This is a placeholder for the full implementation.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


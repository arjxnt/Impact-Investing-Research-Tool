/**
 * Audit Log Page
 * View all data changes and user actions
 */
import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../components/AuthContext'
import { AuditLog } from '../types/collaboration'
import { FileText, Filter, Search, User as UserIcon, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AuditLogPage() {
  const { isAuthenticated, user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEntityType, setFilterEntityType] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs()
    }
  }, [isAuthenticated, filterEntityType, filterAction])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterEntityType !== 'all') params.entity_type = filterEntityType
      if (filterAction !== 'all') params.action = filterAction
      
      const response = await api.get('/audit-logs', { params })
      setLogs(response.data || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        log.user_name?.toLowerCase().includes(searchLower) ||
        log.entity_type.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.entity_id.toString().includes(searchTerm)
      )
    }
    return true
  })

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      case 'view':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
        <p className="mt-1 text-sm text-gray-500">Please log in to view audit logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track all data changes and user actions across the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterEntityType}
            onChange={(e) => setFilterEntityType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Entities</option>
            <option value="investment">Investments</option>
            <option value="climate_risk">Climate Risk</option>
            <option value="esg_score">ESG Scores</option>
            <option value="emissions">Emissions</option>
            <option value="social_impact">Social Impact</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, entity, or action..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Audit Logs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterEntityType !== 'all' || filterAction !== 'all'
              ? 'Try adjusting your filters.'
              : 'Audit logs will appear here as users interact with the system.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {log.user_name || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.changed_fields && log.changed_fields.length > 0 ? (
                        <span className="text-xs">
                          {log.changed_fields.length} field{log.changed_fields.length !== 1 ? 's' : ''} changed
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No changes</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


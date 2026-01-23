import { useState, useEffect } from 'react'
import api from '../api/client'
import { Notification, NotificationSummary } from '../types'
import { 
  Bell, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Database
} from 'lucide-react'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [summary, setSummary] = useState<NotificationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/notifications', {
        params: filter !== 'all' ? { severity: filter } : {}
      })
      setNotifications(response.data.notifications || [])
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />
      case 'low':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'metric_change':
        return <TrendingUp className="h-4 w-4" />
      case 'risk_threshold':
        return <AlertTriangle className="h-4 w-4" />
      case 'assessment_due':
        return <Calendar className="h-4 w-4" />
      case 'data_quality':
        return <Database className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.severity === filter)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
                {summary && (
                  <span className="px-3 py-1 text-sm font-semibold text-white bg-primary-600 rounded-full">
                    {summary.total}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-600 font-medium">Critical</div>
                  <div className="text-2xl font-bold text-red-700">{summary.critical}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-sm text-orange-600 font-medium">High</div>
                  <div className="text-2xl font-bold text-orange-700">{summary.high}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm text-yellow-600 font-medium">Medium</div>
                  <div className="text-2xl font-bold text-yellow-700">{summary.medium}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm text-gray-600 font-medium">Total</div>
                  <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex space-x-2 mb-4">
              {(['all', 'critical', 'high', 'medium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${getSeverityColor(notification.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(notification.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {getTypeIcon(notification.type)}
                            <span>
                              {new Date(notification.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                        {notification.investment_name && (
                          <p className="mt-2 text-xs text-gray-500">
                            Investment: {notification.investment_name}
                          </p>
                        )}
                        {notification.change !== undefined && (
                          <div className="mt-2 flex items-center space-x-2">
                            {notification.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-xs font-medium">
                              Change: {notification.change > 0 ? '+' : ''}{notification.change.toFixed(1)}
                              {notification.metric === 'emissions' ? '%' : notification.metric === 'esg_score' ? ' points' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


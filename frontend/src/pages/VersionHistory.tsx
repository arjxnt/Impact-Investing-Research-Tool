/**
 * Version History Page
 * View and restore previous versions of assessments
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { VersionHistory } from '../types/collaboration'
import { History, RotateCcw, Calendar, User as UserIcon, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface VersionHistoryPageProps {
  entityType?: string
  entityId?: number
}

export default function VersionHistoryPage({ entityType: propEntityType, entityId: propEntityId }: VersionHistoryPageProps) {
  const { entityType: paramEntityType, entityId: paramEntityId } = useParams<{ entityType: string; entityId: string }>()
  const entityType = propEntityType || paramEntityType || 'investment'
  const entityId = propEntityId || (paramEntityId ? parseInt(paramEntityId) : undefined)
  
  const [versions, setVersions] = useState<VersionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<VersionHistory | null>(null)

  useEffect(() => {
    if (entityId) {
      fetchVersions()
    }
  }, [entityType, entityId])

  const fetchVersions = async () => {
    if (!entityId) return
    
    try {
      setLoading(true)
      const response = await api.get(`/versions/${entityType}/${entityId}`)
      setVersions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch version history:', error)
      setVersions([])
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId: number) => {
    if (!confirm('Are you sure you want to restore this version? This will overwrite the current data.')) {
      return
    }

    try {
      const response = await api.get(`/versions/${versionId}/restore`)
      const entityData = response.data.entity_data
      
      // Here you would typically update the entity with the restored data
      // This is a placeholder - actual implementation depends on entity type
      alert('Version restoration would be implemented here. Data retrieved successfully.')
      console.log('Restore data:', entityData)
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version. Please try again.')
    }
  }

  if (!entityId) {
    return (
      <div className="text-center py-12">
        <History className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Entity Selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please navigate to an investment or assessment detail page to view version history.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and restore previous versions of {entityType} #{entityId}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No version history</h3>
          <p className="mt-1 text-sm text-gray-500">
            Version history will appear here as changes are made to this {entityType}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Versions List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Versions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Version {version.version_number}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          version.action === 'create'
                            ? 'bg-green-100 text-green-800'
                            : version.action === 'update'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {version.action}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(version.id)
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      title="Restore this version"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <UserIcon className="h-3 w-3 mr-1" />
                      {version.user_name || 'System'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {version.change_summary && (
                    <p className="mt-2 text-sm text-gray-600">{version.change_summary}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Version Details */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Version Details</h2>
            </div>
            <div className="p-6">
              {selectedVersion ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Version Information</h3>
                    <dl className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Version Number:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {selectedVersion.version_number}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Action:</dt>
                        <dd className="text-sm font-medium text-gray-900">{selectedVersion.action}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Created By:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {selectedVersion.user_name || 'System'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Created:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(selectedVersion.created_at).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  {selectedVersion.change_summary && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Change Summary</h3>
                      <p className="text-sm text-gray-700">{selectedVersion.change_summary}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Entity Data</h3>
                    <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedVersion.entity_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Select a version to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


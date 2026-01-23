import { useState, useRef } from 'react'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import api from '../api/client'

interface DataImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dataType?: 'investment' | 'climate_risk' | 'esg_score' | 'emissions' | 'social_impact'
}

export default function DataImportModal({
  isOpen,
  onClose,
  onSuccess,
  dataType = 'investment'
}: DataImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [columns, setColumns] = useState<string[]>([])
  const [sampleData, setSampleData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [step, setStep] = useState<'upload' | 'mapping' | 'results'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert('Please select a CSV or Excel file')
      return
    }

    setFile(selectedFile)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('data_type', dataType)

      const response = await api.post('/data-import/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setColumns(response.data.columns || [])
      setSampleData(response.data.sample_data || [])
      setSuggestions(response.data.field_suggestions || {})

      // Auto-map suggested fields
      const autoMapping: Record<string, string> = {}
      const fieldSuggestions = response.data.field_suggestions || {}
      Object.entries(fieldSuggestions).forEach(([field, suggestions]) => {
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          autoMapping[field] = suggestions[0]
        }
      })
      setFieldMapping(autoMapping)

      setStep('mapping')
    } catch (error: any) {
      console.error('Error parsing file:', error)
      alert(`Error parsing file: ${error.response?.data?.detail || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file || Object.keys(fieldMapping).length === 0) {
      alert('Please complete field mapping')
      return
    }

    setImporting(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('data_type', dataType)
      formData.append('field_mapping_json', JSON.stringify(fieldMapping))
      formData.append('skip_errors', 'true')

      const response = await api.post('/data-import/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResults(response.data)
      setStep('results')
      onSuccess()
    } catch (error: any) {
      console.error('Error importing data:', error)
      alert(`Error importing data: ${error.response?.data?.detail || error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setFieldMapping({})
    setSuggestions({})
    setColumns([])
    setSampleData([])
    setResults(null)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Define expected fields for each data type
  const expectedFields: Record<string, string[]> = {
    investment: ['name', 'company_name', 'sector', 'industry', 'region', 'country', 'investment_amount', 'current_value', 'investment_date', 'website'],
    climate_risk: ['investment_id', 'assessment_date', 'physical_risk_score', 'transition_risk_score', 'flood_risk', 'drought_risk'],
    esg_score: ['investment_id', 'assessment_date', 'overall_esg_score', 'environmental_score', 'social_score', 'governance_score'],
    emissions: ['investment_id', 'reporting_year', 'scope1_emissions', 'scope2_emissions', 'scope3_emissions', 'total_emissions'],
    social_impact: ['investment_id', 'assessment_date', 'overall_impact_score', 'beneficiaries_reached', 'jobs_created']
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (CSV or Excel)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelect(e.target.files[0])
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV, XLSX, XLS up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Field Mapping</h3>
                <p className="text-sm text-gray-600">
                  Map your file columns to database fields. {sampleData.length > 0 && `Found ${columns.length} columns and ${sampleData.length} sample rows.`}
                </p>
              </div>

              {/* Sample Data Preview */}
              {sampleData.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Sample Data (First 3 rows)</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-300">
                          {columns.slice(0, 6).map((col) => (
                            <th key={col} className="text-left py-2 px-2 font-medium text-gray-700">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleData.slice(0, 3).map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            {columns.slice(0, 6).map((col) => (
                              <td key={col} className="py-2 px-2 text-gray-600">
                                {row[col]?.toString().substring(0, 20) || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Field Mapping */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Required Fields</p>
                {expectedFields[dataType]?.map((field) => (
                  <div key={field} className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {field === 'name' || field === 'investment_id' ? (
                        <span className="text-red-500 ml-1">*</span>
                      ) : null}
                    </label>
                    <select
                      value={fieldMapping[field] || ''}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, [field]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select column...</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                          {suggestions[field]?.includes(col) && ' (suggested)'}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || (dataType === 'investment' ? !fieldMapping['name'] : !fieldMapping['investment_id'])}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import Data</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'results' && results && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                {results.success ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  Import {results.success ? 'Completed' : 'Failed'}
                </h3>
              </div>

              {results.results && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Successfully imported:</span>
                    <span className="text-sm font-bold text-green-600">{results.results.success || 0} rows</span>
                  </div>
                  {results.results.skipped > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Skipped:</span>
                      <span className="text-sm font-bold text-yellow-600">{results.results.skipped} rows</span>
                    </div>
                  )}
                  {results.results.errors && results.results.errors.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Errors:</span>
                      <span className="text-sm font-bold text-red-600 ml-2">{results.results.errors.length}</span>
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {results.results.errors.slice(0, 5).map((error: string, idx: number) => (
                          <p key={idx} className="text-xs text-red-600">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              <span className="ml-3 text-gray-600">Parsing file...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Investment } from '../types'
import { Plus, Search, Building2, ExternalLink } from 'lucide-react'
import AddInvestmentModal from '../components/AddInvestmentModal'
import DataImportModal from '../components/DataImportModal'
import { getCompanyLogoUrl, getPlaceholderLogo } from '../utils/logoUtils'
import { formatCurrency } from '../utils/formatCurrency'

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [logoErrors, setLogoErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/investments').catch((err) => {
        console.error('Investments API error:', err)
        return { data: [] }
      })
      console.log('Investments response:', response)
      const data = response?.data || response || []
      console.log(`Loaded ${Array.isArray(data) ? data.length : 0} investments`)
      if (Array.isArray(data) && data.length > 0) {
        setInvestments(data)
      } else {
        console.warn('No investments in response:', data)
        setInvestments([])
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredInvestments = investments.filter(inv =>
    inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.sector && inv.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and analyze your investment portfolio
            {investments.length > 0 && (
              <span className="ml-2 font-semibold text-primary-600">
                ({investments.length} {investments.length === 1 ? 'company' : 'companies'})
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Import</span>
          </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Investment
        </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Search investments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Portfolio Summary Card */}
      {investments.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Portfolio Summary</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">
                {investments.length} {investments.length === 1 ? 'Investment' : 'Investments'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-600">Total Value</p>
              <p className="text-xl font-bold text-primary-700">
                {formatCurrency(investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {filteredInvestments.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No investments found matching your search.' : 'No investments yet.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Investment
                </button>
              )}
            </li>
          ) : (
            filteredInvestments.map((investment) => {
              const logoUrl = getCompanyLogoUrl(investment.company_name || investment.name, investment.website)
              const hasLogoError = logoErrors[investment.id]
              const placeholder = getPlaceholderLogo(investment.company_name || investment.name)
              
              return (
                <li key={investment.id}>
                  <Link
                    to={`/investments/${investment.id}`}
                    className="block hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 border-l-4 border-transparent hover:border-primary-500"
                  >
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 relative">
                            {!hasLogoError && logoUrl && !logoUrl.includes('placeholder') ? (
                              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center shadow-sm">
                                <img
                                  src={logoUrl}
                                  alt={`${investment.company_name || investment.name} logo`}
                                  className="w-full h-full object-contain p-1.5"
                                  onError={() => {
                                    setLogoErrors(prev => ({ ...prev, [investment.id]: true }))
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-sm border-2 border-gray-100"
                                style={{ backgroundColor: placeholder.color }}
                              >
                                {placeholder.initials}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <p className="text-base font-semibold text-gray-900">
                                {investment.name}
                              </p>
                              {investment.website && (
                                <a
                                  href={investment.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary-600 hover:text-primary-700 transition-colors"
                                  title="Visit company website"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {investment.company_name}
                            </p>
                            {investment.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {investment.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sector</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {investment.sector || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Region</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {investment.region || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</p>
                            <p className="text-sm font-bold text-primary-600 mt-1">
                              {formatCurrency(investment.current_value)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              investment.status === 'active'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                : investment.status === 'exited'
                                ? 'bg-gray-100 text-gray-800 border border-gray-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {investment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </div>

      <AddInvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvestments}
      />
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchInvestments}
        dataType="investment"
      />
    </div>
  )
}


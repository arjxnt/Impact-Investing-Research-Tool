import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { Investment, ESGScore, ClimateRisk, GHGEmissions, SocialImpact } from '../types'
import { ArrowLeft, ExternalLink, Shield, CloudRain, Factory, Users, Building2 } from 'lucide-react'
import InvestmentRecommendation from '../components/InvestmentRecommendation'
import CommentSection from '../components/CommentSection'
import { getCompanyLogoUrl, getPlaceholderLogo } from '../utils/logoUtils'
import { formatCurrency, formatNumber } from '../utils/formatCurrency'

export default function InvestmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [investment, setInvestment] = useState<Investment | null>(null)
  const [esgScore, setEsgScore] = useState<ESGScore | null>(null)
  const [climateRisk, setClimateRisk] = useState<ClimateRisk | null>(null)
  const [emissions, setEmissions] = useState<GHGEmissions | null>(null)
  const [socialImpact, setSocialImpact] = useState<SocialImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset state when ID changes
    setInvestment(null)
    setEsgScore(null)
    setClimateRisk(null)
    setEmissions(null)
    setSocialImpact(null)
    setError(null)
    setLogoError(false)
    
    if (id) {
      const investmentId = parseInt(id)
      if (!isNaN(investmentId) && investmentId > 0) {
        fetchInvestmentData(investmentId)
      } else {
        setLoading(false)
        setInvestment(null)
        setError('Invalid investment ID')
      }
    } else {
      setLoading(false)
      setInvestment(null)
      setError('No investment ID provided')
    }
  }, [id])

  const fetchInvestmentData = async (investmentId: number) => {
    if (!investmentId || isNaN(investmentId) || investmentId <= 0) {
      console.error('Invalid investment ID:', investmentId)
      setLoading(false)
      setInvestment(null)
      return
    }

    try {
      setLoading(true)
      setInvestment(null) // Clear previous data
      
      const [invRes, esgRes, riskRes, emissionsRes, impactRes] = await Promise.allSettled([
        api.get(`/investments/${investmentId}`).catch(() => ({ data: null })),
        api.get(`/esg-scores?investment_id=${investmentId}`).catch(() => ({ data: [] })),
        api.get(`/climate-risks?investment_id=${investmentId}`).catch(() => ({ data: [] })),
        api.get(`/ghg-emissions?investment_id=${investmentId}`).catch(() => ({ data: [] })),
        api.get(`/social-impacts?investment_id=${investmentId}`).catch(() => ({ data: [] })),
      ])

      // Handle investment response
      if (invRes.status === 'fulfilled' && invRes.value?.data) {
        setInvestment(invRes.value.data)
        setError(null)
      } else {
        const errorMsg = invRes.status === 'rejected' 
          ? (invRes.reason?.response?.status === 404 ? 'Investment not found' : 'Error loading investment')
          : 'Investment not found'
        console.error('Investment not found:', investmentId, invRes.status === 'rejected' ? invRes.reason : 'No data')
        setInvestment(null)
        setError(errorMsg)
      }

      // Handle other data (optional, won't break if missing)
      if (esgRes.status === 'fulfilled' && esgRes.value?.data) {
        setEsgScore(esgRes.value.data[0] || null)
      }
      if (riskRes.status === 'fulfilled' && riskRes.value?.data) {
        setClimateRisk(riskRes.value.data[0] || null)
      }
      if (emissionsRes.status === 'fulfilled' && emissionsRes.value?.data) {
        setEmissions(emissionsRes.value.data[0] || null)
      }
      if (impactRes.status === 'fulfilled' && impactRes.value?.data) {
        setSocialImpact(impactRes.value.data[0] || null)
      }
    } catch (error: any) {
      console.error('Error fetching investment data:', error)
      setInvestment(null)
      setError(error?.message || 'Failed to load investment data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investment details...</p>
        </div>
      </div>
    )
  }

  if (!loading && !investment) {
    return (
      <div className="space-y-6">
        <Link
          to="/investments"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investments
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Investment Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The investment you're looking for doesn't exist or may have been removed."}
            </p>
            <Link
              to="/investments"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View All Investments
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!investment) {
    // Still loading or no investment - show loading state
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/investments"
        className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Investments
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {logoError ? (
                (() => {
                  const placeholder = getPlaceholderLogo(investment.company_name || investment.name)
                  return (
                    <div 
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-gray-100"
                      style={{ backgroundColor: placeholder.color }}
                    >
                      {placeholder.initials}
                    </div>
                  )
                })()
              ) : (() => {
                const logoUrl = getCompanyLogoUrl(investment.company_name || investment.name, investment.website)
                const placeholder = getPlaceholderLogo(investment.company_name || investment.name)
                
                if (logoUrl && !logoUrl.includes('placeholder')) {
                  return (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 bg-white flex items-center justify-center shadow-sm">
                      <img
                        src={logoUrl}
                        alt={`${investment.company_name || investment.name} logo`}
                        className="w-full h-full object-contain p-2"
                        onError={() => setLogoError(true)}
                        loading="lazy"
                      />
                    </div>
                  )
                }
                
                return (
                  <div 
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-gray-100"
                    style={{ backgroundColor: placeholder.color }}
                  >
                    {placeholder.initials}
                  </div>
                )
              })()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{investment.name}</h1>
              <p className="mt-1 text-sm text-gray-600">{investment.company_name}</p>
            </div>
          </div>
          {investment.website && (
            <a
              href={investment.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Visit Website
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ESG Score</p>
          <p className="text-3xl font-bold text-indigo-600">
            {esgScore?.overall_esg_score?.toFixed(1) || 'N/A'}
            {esgScore?.overall_esg_score && (
              <span className="text-lg text-gray-500 ml-2">/100</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <CloudRain className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Climate Risk</p>
          <p className="text-3xl font-bold text-orange-600">
            {climateRisk?.physical_risk_score || climateRisk?.transition_risk_score
              ? Math.max(
                  climateRisk.physical_risk_score || 0,
                  climateRisk.transition_risk_score || 0
                ).toFixed(1)
              : 'N/A'}
            {climateRisk && (
              <span className="text-lg text-gray-500 ml-2">/10</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Factory className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Emissions</p>
          <p className="text-3xl font-bold text-red-600">
            {emissions?.total_emissions
              ? formatNumber(emissions.total_emissions)
              : 'N/A'}
            {emissions?.total_emissions && (
              <span className="text-sm text-gray-500 ml-2">tCO2e</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Social Impact</p>
          <p className="text-3xl font-bold text-purple-600">
            {socialImpact?.overall_impact_score?.toFixed(1) || 'N/A'}
            {socialImpact?.overall_impact_score && (
              <span className="text-lg text-gray-500 ml-2">/10</span>
            )}
          </p>
        </div>
      </div>

      {/* Company Overview */}
      {investment.description && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Overview</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{investment.description}</p>
        </div>
      )}

      {/* Investment Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Investment Details</h3>
        </div>
        <div className="px-6 py-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Sector</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.sector || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.industry || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Region</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.region || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.country || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Investment Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.investment_type || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Investment Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {investment.investment_date 
                  ? new Date(investment.investment_date).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Investment Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatCurrency(investment.investment_amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Value</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatCurrency(investment.current_value)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ownership</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {investment.ownership_percentage
                  ? `${investment.ownership_percentage}%`
                  : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  investment.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : investment.status === 'exited'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {investment.status}
                </span>
              </dd>
            </div>
          </dl>
          {investment.description && (
            <div className="mt-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{investment.description}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Investment Recommendation */}
      {investment && (
        <InvestmentRecommendation investmentId={investment.id} />
      )}

      {/* Comments Section */}
      {investment && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <CommentSection entityType="investment" entityId={investment.id} />
        </div>
      )}
    </div>
  )
}


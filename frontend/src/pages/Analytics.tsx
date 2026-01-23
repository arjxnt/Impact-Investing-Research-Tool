import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import {
  InvestmentBenchmarkComparison,
  ImpactAttribution,
  PortfolioOptimization,
  CorrelationAnalysis,
  MonteCarloSimulation,
  Investment
} from '../types'
import {
  BarChart3, TrendingUp, Target, Activity, Calculator,
  ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2
} from 'lucide-react'
import { formatNumber } from '../utils/formatCurrency'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'benchmarking' | 'attribution' | 'optimization' | 'correlation' | 'montecarlo'>('benchmarking')
  const [investments, setInvestments] = useState<Investment[]>([])
  const [benchmarkComparisons, setBenchmarkComparisons] = useState<InvestmentBenchmarkComparison[]>([])
  const [attributions, setAttributions] = useState<ImpactAttribution[]>([])
  const [optimizations, setOptimizations] = useState<PortfolioOptimization[]>([])
  const [correlationAnalysis, setCorrelationAnalysis] = useState<CorrelationAnalysis | null>(null)
  const [simulations, setSimulations] = useState<MonteCarloSimulation[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invRes] = await Promise.allSettled([
        api.get('/investments').catch(() => ({ data: [] }))
      ])
      
      if (invRes.status === 'fulfilled') {
        const data = invRes.value?.data || []
        console.log(`Loaded ${data.length} investments for Analytics page`)
        setInvestments(data)
      } else {
        console.error('Investments request failed:', invRes.reason)
        setInvestments([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const loadTabData = async () => {
    try {
      switch (activeTab) {
        case 'benchmarking':
          await loadBenchmarkData()
          break
        case 'attribution':
          await loadAttributionData()
          break
        case 'optimization':
          await loadOptimizationData()
          break
        case 'correlation':
          await loadCorrelationData()
          break
        case 'montecarlo':
          await loadSimulationData()
          break
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} data:`, error)
    }
  }

  useEffect(() => {
    if (!loading && investments.length >= 0) {
      loadTabData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loading])

  const loadBenchmarkData = async () => {
    try {
      if (!investments || investments.length === 0) {
        setBenchmarkComparisons([])
        return
      }
      
      const comparisons = await Promise.allSettled(
        investments.slice(0, 10).map(inv =>
          api.get(`/investments/${inv.id}/benchmark-comparison`).catch(() => ({ data: null }))
        )
      )
      
      const validComparisons = comparisons
        .filter(c => c.status === 'fulfilled' && c.value?.data)
        .map(c => (c as any).value.data)
      
      setBenchmarkComparisons(validComparisons || [])
    } catch (error) {
      console.error('Error loading benchmark data:', error)
      setBenchmarkComparisons([])
    }
  }

  const loadAttributionData = async () => {
    try {
      const res = await api.get('/analytics/impact-attribution').catch(() => ({ data: [] }))
      setAttributions(res.data || [])
    } catch (error) {
      console.error('Error loading attribution data:', error)
    }
  }

  const loadOptimizationData = async () => {
    try {
      const res = await api.get('/analytics/portfolio-optimization?limit=5').catch(() => ({ data: [] }))
      setOptimizations(res.data || [])
    } catch (error) {
      console.error('Error loading optimization data:', error)
    }
  }

  const loadCorrelationData = async () => {
    try {
      const res = await api.get('/analytics/correlation-analysis/latest').catch(() => ({ data: null }))
      setCorrelationAnalysis(res.data)
    } catch (error) {
      console.error('Error loading correlation data:', error)
    }
  }

  const loadSimulationData = async () => {
    try {
      const res = await api.get('/analytics/monte-carlo?limit=5').catch(() => ({ data: [] }))
      setSimulations(res.data || [])
    } catch (error) {
      console.error('Error loading simulation data:', error)
    }
  }

  const handleCalculateBenchmarks = async () => {
    try {
      setCalculating(true)
      await api.post('/analytics/benchmarks/calculate').catch(() => null)
      await loadBenchmarkData()
    } catch (error) {
      console.error('Error calculating benchmarks:', error)
    } finally {
      setCalculating(false)
    }
  }

  const handleCalculateCorrelations = async () => {
    try {
      setCalculating(true)
      const res = await api.post('/analytics/correlation-analysis').catch(() => ({ data: null }))
      setCorrelationAnalysis(res?.data || null)
    } catch (error) {
      console.error('Error calculating correlations:', error)
      setCorrelationAnalysis(null)
    } finally {
      setCalculating(false)
    }
  }

  const handleRunOptimization = async (targets: {
    target_impact_score?: number
    target_esg_score?: number
    max_climate_risk?: number
    min_roi_threshold?: number
  }) => {
    try {
      setCalculating(true)
      const queryParams = new URLSearchParams()
      if (targets.target_impact_score !== undefined) queryParams.append('target_impact_score', targets.target_impact_score.toString())
      if (targets.target_esg_score !== undefined) queryParams.append('target_esg_score', targets.target_esg_score.toString())
      if (targets.max_climate_risk !== undefined) queryParams.append('max_climate_risk', targets.max_climate_risk.toString())
      if (targets.min_roi_threshold !== undefined) queryParams.append('min_roi_threshold', targets.min_roi_threshold.toString())
      
      const url = `/analytics/portfolio-optimization${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const res = await api.post(url)
      await loadOptimizationData()
      return res.data
    } catch (error) {
      console.error('Error running optimization:', error)
      throw error
    } finally {
      setCalculating(false)
    }
  }

  const handleRunSimulation = async (params: {
    simulation_name: string
    num_iterations?: number
    time_horizon_years?: number
    scenario_type?: string
    climate_scenario?: string
    market_volatility?: number
  }) => {
    try {
      setCalculating(true)
      const queryParams = new URLSearchParams()
      queryParams.append('simulation_name', params.simulation_name)
      if (params.num_iterations !== undefined) queryParams.append('num_iterations', params.num_iterations.toString())
      if (params.time_horizon_years !== undefined) queryParams.append('time_horizon_years', params.time_horizon_years.toString())
      if (params.scenario_type) queryParams.append('scenario_type', params.scenario_type)
      if (params.climate_scenario) queryParams.append('climate_scenario', params.climate_scenario)
      if (params.market_volatility !== undefined) queryParams.append('market_volatility', params.market_volatility.toString())
      
      const url = `/analytics/monte-carlo?${queryParams.toString()}`
      const res = await api.post(url)
      await loadSimulationData()
      return res.data
    } catch (error) {
      console.error('Error running simulation:', error)
      throw error
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'benchmarking' as const, name: 'Peer Benchmarking', icon: BarChart3 },
    { id: 'attribution' as const, name: 'Impact Attribution', icon: Target },
    { id: 'optimization' as const, name: 'Portfolio Optimization', icon: TrendingUp },
    { id: 'correlation' as const, name: 'Correlation Analysis', icon: Activity },
    { id: 'montecarlo' as const, name: 'Monte Carlo Simulation', icon: Calculator },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Advanced Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive analytics and insights for portfolio optimization and impact measurement
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'benchmarking' && (
            <BenchmarkingTab
              comparisons={benchmarkComparisons}
              onCalculate={handleCalculateBenchmarks}
              calculating={calculating}
            />
          )}

          {activeTab === 'attribution' && (
            <AttributionTab
              attributions={attributions}
              investments={investments}
            />
          )}

          {activeTab === 'optimization' && (
            <OptimizationTab
              optimizations={optimizations}
              onRunOptimization={handleRunOptimization}
              calculating={calculating}
            />
          )}

          {activeTab === 'correlation' && (
            <CorrelationTab
              analysis={correlationAnalysis}
              onCalculate={handleCalculateCorrelations}
              calculating={calculating}
            />
          )}

          {activeTab === 'montecarlo' && (
            <MonteCarloTab
              simulations={simulations}
              onRunSimulation={handleRunSimulation}
              calculating={calculating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Benchmarking Tab ====================

function BenchmarkingTab({
  comparisons,
  onCalculate,
  calculating
}: {
  comparisons: InvestmentBenchmarkComparison[]
  investments?: Investment[]
  onCalculate: () => Promise<void>
  calculating: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Peer Benchmarking</h2>
          <p className="text-sm text-gray-600 mt-1">
            Compare your investments against sector and industry peers
          </p>
        </div>
        <button
          onClick={onCalculate}
          disabled={calculating}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? 'Calculating...' : 'Calculate Benchmarks'}
        </button>
      </div>

      {comparisons.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No benchmark comparisons available</p>
          <p className="text-sm text-gray-400 mt-2">Click "Calculate Benchmarks" to generate comparisons</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comparisons.map((comp) => (
            <div key={comp.investment_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Link
                    to={`/investments/${comp.investment_id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {comp.investment_name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {comp.sector} {comp.industry ? `• ${comp.industry}` : ''} {comp.region ? `• ${comp.region}` : ''}
                  </p>
                </div>
                {comp.esg_percentile !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">ESG Percentile</p>
                    <p className={`text-2xl font-bold ${
                      comp.esg_percentile >= 75 ? 'text-green-600' :
                      comp.esg_percentile >= 50 ? 'text-blue-600' :
                      comp.esg_percentile >= 25 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {comp.esg_percentile.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              {comp.benchmark && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ESG Score</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comp.investment_esg_score?.toFixed(1) || 'N/A'}
                      </span>
                      {comp.benchmark.avg_esg_score && comp.investment_esg_score && (
                        <span className={`text-xs ${
                          comp.investment_esg_score > comp.benchmark.avg_esg_score ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comp.investment_esg_score > comp.benchmark.avg_esg_score ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {comp.benchmark.avg_esg_score && (
                      <p className="text-xs text-gray-400 mt-1">Avg: {comp.benchmark.avg_esg_score.toFixed(1)}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">ROI</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comp.investment_roi ? `${comp.investment_roi > 0 ? '+' : ''}${comp.investment_roi.toFixed(1)}%` : 'N/A'}
                      </span>
                      {comp.benchmark.avg_roi && comp.investment_roi && (
                        <span className={`text-xs ${
                          comp.investment_roi > comp.benchmark.avg_roi ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comp.investment_roi > comp.benchmark.avg_roi ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {comp.benchmark.avg_roi && (
                      <p className="text-xs text-gray-400 mt-1">Avg: {comp.benchmark.avg_roi.toFixed(1)}%</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Climate Risk</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comp.investment_physical_risk?.toFixed(1) || 'N/A'}
                      </span>
                      {comp.benchmark.avg_physical_risk && comp.investment_physical_risk && (
                        <span className={`text-xs ${
                          comp.investment_physical_risk < comp.benchmark.avg_physical_risk ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comp.investment_physical_risk < comp.benchmark.avg_physical_risk ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {comp.benchmark.avg_physical_risk && (
                      <p className="text-xs text-gray-400 mt-1">Avg: {comp.benchmark.avg_physical_risk.toFixed(1)}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Impact Score</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comp.investment_impact_score?.toFixed(1) || 'N/A'}
                      </span>
                      {comp.benchmark.avg_impact_score && comp.investment_impact_score && (
                        <span className={`text-xs ${
                          comp.investment_impact_score > comp.benchmark.avg_impact_score ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {comp.investment_impact_score > comp.benchmark.avg_impact_score ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {comp.benchmark.avg_impact_score && (
                      <p className="text-xs text-gray-400 mt-1">Avg: {comp.benchmark.avg_impact_score.toFixed(1)}</p>
                    )}
                  </div>
                </div>
              )}

              {(comp.strengths.length > 0 || comp.weaknesses.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comp.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {comp.strengths.map((strength, idx) => (
                            <li key={idx} className="text-xs text-gray-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {comp.weaknesses.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 text-orange-600 mr-1" />
                          Areas for Improvement
                        </p>
                        <ul className="space-y-1">
                          {comp.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-xs text-gray-600">• {weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {comp.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Recommendations</p>
                  <ul className="space-y-1">
                    {comp.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-600">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Attribution Tab ====================

function AttributionTab({
  attributions,
  investments
}: {
  attributions: ImpactAttribution[]
  investments: Investment[]
}) {
  const portfolioTotal = attributions.reduce((sum, a) => sum + (a.portfolio_impact_percentage || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Impact Attribution</h2>
        <p className="text-sm text-gray-600 mt-1">
          Quantify each investment's contribution to SDG goals and overall portfolio impact
        </p>
      </div>

      {attributions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No impact attribution data available</p>
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Portfolio Impact</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioTotal.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Beneficiaries</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(attributions.reduce((sum, a) => sum + (a.beneficiaries_attributed || 0), 0))}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Jobs Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(attributions.reduce((sum, a) => sum + (a.jobs_attributed || 0), 0))}
              </p>
            </div>
          </div>

          {/* Attribution Details */}
          <div className="space-y-4">
            {attributions.map((attr) => {
              const investment = investments.find(inv => inv.id === attr.investment_id)
              return (
                <div key={attr.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {investment && (
                        <Link
                          to={`/investments/${attr.investment_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {investment.name}
                        </Link>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Portfolio Impact: {attr.portfolio_impact_percentage?.toFixed(1) || 0}%
                      </p>
                    </div>
                    {attr.primary_sdg_contribution && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Primary SDG</p>
                        <p className="text-xl font-bold text-primary-600">SDG {attr.primary_sdg_contribution}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Beneficiaries</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(attr.beneficiaries_attributed || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Jobs Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(attr.jobs_attributed || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ESG Contribution</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {attr.portfolio_esg_contribution?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Confidence</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {attr.confidence_level?.toFixed(0) || 0}%
                      </p>
                    </div>
                  </div>

                  {attr.sdg_contributions && Object.keys(attr.sdg_contributions).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">SDG Contributions</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(attr.sdg_contributions)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([sdg, score]) => (
                            <span
                              key={sdg}
                              className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium"
                            >
                              SDG {sdg}: {score.toFixed(1)}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ==================== Optimization Tab ====================

function OptimizationTab({
  optimizations,
  onRunOptimization,
  calculating
}: {
  optimizations: PortfolioOptimization[]
  onRunOptimization: (targets: any) => Promise<any>
  calculating: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    target_impact_score: '',
    target_esg_score: '',
    max_climate_risk: '',
    min_roi_threshold: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targets: any = {}
    if (formData.target_impact_score) targets.target_impact_score = parseFloat(formData.target_impact_score)
    if (formData.target_esg_score) targets.target_esg_score = parseFloat(formData.target_esg_score)
    if (formData.max_climate_risk) targets.max_climate_risk = parseFloat(formData.max_climate_risk)
    if (formData.min_roi_threshold) targets.min_roi_threshold = parseFloat(formData.min_roi_threshold)
    
    try {
      await onRunOptimization(targets)
      setShowForm(false)
      setFormData({ target_impact_score: '', target_esg_score: '', max_climate_risk: '', min_roi_threshold: '' })
    } catch (error) {
      console.error('Error running optimization:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Optimization</h2>
          <p className="text-sm text-gray-600 mt-1">
            Get AI-powered suggestions for portfolio rebalancing based on impact-risk-return optimization
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Run Optimization'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Impact Score (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.target_impact_score}
                  onChange={(e) => setFormData({ ...formData, target_impact_score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target ESG Score (0-100)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.target_esg_score}
                  onChange={(e) => setFormData({ ...formData, target_esg_score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Climate Risk (0-10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.max_climate_risk}
                  onChange={(e) => setFormData({ ...formData, max_climate_risk: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min ROI Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.min_roi_threshold}
                  onChange={(e) => setFormData({ ...formData, min_roi_threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={calculating}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {calculating ? 'Optimizing...' : 'Run Optimization'}
              </button>
            </div>
          </form>
        </div>
      )}

      {optimizations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No optimization analyses available</p>
          <p className="text-sm text-gray-400 mt-2">Run an optimization analysis to get portfolio suggestions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {optimizations.map((opt) => (
            <div key={opt.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Optimization Analysis</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(opt.analysis_date).toLocaleDateString()} • {opt.optimization_method || 'impact_weighted'}
                  </p>
                </div>
              </div>

              {/* Current vs Optimized */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Impact Score</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{opt.current_impact_score?.toFixed(1) || 'N/A'}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-semibold text-primary-600">{opt.optimized_impact_score?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ESG Score</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{opt.current_esg_score?.toFixed(1) || 'N/A'}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-semibold text-primary-600">{opt.optimized_esg_score?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Climate Risk</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{opt.current_climate_risk?.toFixed(1) || 'N/A'}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-semibold text-primary-600">{opt.optimized_climate_risk?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ROI</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{opt.current_roi?.toFixed(1) || 'N/A'}%</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-sm font-semibold text-primary-600">{opt.optimized_roi?.toFixed(1) || 'N/A'}%</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {opt.suggested_rebalancing && Object.keys(opt.suggested_rebalancing).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggested Rebalancing</p>
                  <div className="space-y-2">
                    {Object.entries(opt.suggested_rebalancing).slice(0, 5).map(([invId, change]) => (
                      <div key={invId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Investment {invId}</span>
                        <span className={`font-semibold ${(change as number) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(change as number) > 0 ? '+' : ''}{((change as number) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Correlation Tab ====================

function CorrelationTab({
  analysis,
  onCalculate,
  calculating
}: {
  analysis: CorrelationAnalysis | null
  onCalculate: () => Promise<void>
  calculating: boolean
}) {
  const correlationData = analysis?.correlation_matrix ? Object.entries(analysis.correlation_matrix).map(([pair, value]) => {
    const [metric1, metric2] = pair.split('_')
    return {
      metric1,
      metric2,
      correlation: value as number
    }
  }) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Correlation Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">
            Understand relationships between ESG scores, climate risks, and financial performance
          </p>
        </div>
        <button
          onClick={onCalculate}
          disabled={calculating}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? 'Calculating...' : 'Calculate Correlations'}
        </button>
      </div>

      {!analysis ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No correlation analysis available</p>
          <p className="text-sm text-gray-400 mt-2">Click "Calculate Correlations" to generate analysis</p>
        </div>
      ) : (
        <>
          {/* Key Correlations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Key Correlations</p>
              <div className="space-y-3">
                {analysis.esg_roi_correlation !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ESG ↔ ROI</span>
                    <span className={`text-sm font-semibold ${
                      analysis.esg_roi_correlation > 0.3 ? 'text-green-600' :
                      analysis.esg_roi_correlation < -0.3 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analysis.esg_roi_correlation.toFixed(3)}
                    </span>
                  </div>
                )}
                {analysis.impact_roi_correlation !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Impact ↔ ROI</span>
                    <span className={`text-sm font-semibold ${
                      analysis.impact_roi_correlation > 0.2 ? 'text-green-600' :
                      analysis.impact_roi_correlation < -0.2 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analysis.impact_roi_correlation.toFixed(3)}
                    </span>
                  </div>
                )}
                {analysis.climate_risk_roi_correlation !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Climate Risk ↔ ROI</span>
                    <span className={`text-sm font-semibold ${
                      analysis.climate_risk_roi_correlation < -0.2 ? 'text-green-600' :
                      analysis.climate_risk_roi_correlation > 0.2 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {analysis.climate_risk_roi_correlation.toFixed(3)}
                    </span>
                  </div>
                )}
                {analysis.esg_climate_correlation !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ESG ↔ Climate Risk</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {analysis.esg_climate_correlation.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Insights</p>
              {analysis.key_insights && analysis.key_insights.length > 0 ? (
                <ul className="space-y-2">
                  {analysis.key_insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No insights available</p>
              )}
            </div>
          </div>

          {/* Correlation Matrix Visualization */}
          {correlationData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">Correlation Matrix</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-700 font-medium">Metric Pair</th>
                      <th className="text-right py-2 px-3 text-gray-700 font-medium">Correlation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3 text-gray-600">
                          {item.metric1} ↔ {item.metric2}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-semibold ${
                            item.correlation > 0.5 ? 'text-green-600' :
                            item.correlation < -0.5 ? 'text-red-600' :
                            item.correlation > 0.2 ? 'text-blue-600' :
                            item.correlation < -0.2 ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {item.correlation.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {analysis.recommendations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Recommendations</p>
              <p className="text-sm text-blue-800">{analysis.recommendations}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ==================== Monte Carlo Tab ====================

function MonteCarloTab({
  simulations,
  onRunSimulation,
  calculating
}: {
  simulations: MonteCarloSimulation[]
  onRunSimulation: (params: any) => Promise<any>
  calculating: boolean
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    simulation_name: '',
    num_iterations: '10000',
    time_horizon_years: '5',
    scenario_type: 'baseline',
    climate_scenario: '',
    market_volatility: '0.15'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const params: any = {
      simulation_name: formData.simulation_name || `Simulation ${new Date().toLocaleDateString()}`,
      num_iterations: parseInt(formData.num_iterations),
      time_horizon_years: parseInt(formData.time_horizon_years),
      scenario_type: formData.scenario_type,
      market_volatility: parseFloat(formData.market_volatility)
    }
    if (formData.climate_scenario) params.climate_scenario = formData.climate_scenario
    
    try {
      await onRunSimulation(params)
      setShowForm(false)
      setFormData({
        simulation_name: '',
        num_iterations: '10000',
        time_horizon_years: '5',
        scenario_type: 'baseline',
        climate_scenario: '',
        market_volatility: '0.15'
      })
    } catch (error) {
      console.error('Error running simulation:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monte Carlo Simulation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Run scenario analyses to model portfolio outcomes under different conditions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : 'Run Simulation'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simulation Name
              </label>
              <input
                type="text"
                value={formData.simulation_name}
                onChange={(e) => setFormData({ ...formData, simulation_name: e.target.value })}
                placeholder="e.g., Baseline 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Iterations
                </label>
                <input
                  type="number"
                  value={formData.num_iterations}
                  onChange={(e) => setFormData({ ...formData, num_iterations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Horizon (Years)
                </label>
                <input
                  type="number"
                  value={formData.time_horizon_years}
                  onChange={(e) => setFormData({ ...formData, time_horizon_years: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Type
                </label>
                <select
                  value={formData.scenario_type}
                  onChange={(e) => setFormData({ ...formData, scenario_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="baseline">Baseline</option>
                  <option value="optimistic">Optimistic</option>
                  <option value="pessimistic">Pessimistic</option>
                  <option value="stress_test">Stress Test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Volatility
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.market_volatility}
                  onChange={(e) => setFormData({ ...formData, market_volatility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={calculating}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {calculating ? 'Running...' : 'Run Simulation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {simulations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No simulations available</p>
          <p className="text-sm text-gray-400 mt-2">Run a simulation to model portfolio scenarios</p>
        </div>
      ) : (
        <div className="space-y-4">
          {simulations.map((sim) => (
            <div key={sim.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sim.simulation_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(sim.simulation_date).toLocaleDateString()} • {sim.num_iterations.toLocaleString()} iterations • {sim.time_horizon_years} years
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {sim.scenario_type || 'baseline'}
                </span>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected ROI</p>
                  <p className="text-lg font-bold text-gray-900">
                    {sim.expected_roi ? `${sim.expected_roi > 0 ? '+' : ''}${sim.expected_roi.toFixed(1)}%` : 'N/A'}
                  </p>
                  {sim.roi_std_dev && (
                    <p className="text-xs text-gray-400 mt-1">±{sim.roi_std_dev.toFixed(1)}%</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected Impact</p>
                  <p className="text-lg font-bold text-gray-900">
                    {sim.expected_impact_score?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">VaR (95%)</p>
                  <p className="text-lg font-bold text-red-600">
                    {sim.value_at_risk_95 ? `${sim.value_at_risk_95.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">P(ROI &gt; 0)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {sim.probability_positive_roi?.toFixed(1) || 'N/A'}%
                  </p>
                </div>
              </div>

              {/* Percentiles */}
              {sim.roi_percentiles && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">ROI Distribution Percentiles</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 25, 50, 75, 95].map((p) => (
                      <div key={p} className="text-center">
                        <p className="text-xs text-gray-500">{p}th</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {sim.roi_percentiles?.[p] ? `${sim.roi_percentiles[p].toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


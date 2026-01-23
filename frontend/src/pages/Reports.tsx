import { useEffect, useState } from 'react'
import api from '../api/client'
import { FileText, Download, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatNumber } from '../utils/formatCurrency'

export default function Reports() {
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null)
  const [climateReport, setClimateReport] = useState<any>(null)
  const [impactReport, setImpactReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [summaryRes, climateRes, impactRes] = await Promise.allSettled([
        api.get('/reports/portfolio-summary').catch(() => ({ data: null })),
        api.get('/reports/climate-risk-report').catch(() => ({ data: null })),
        api.get('/reports/impact-report').catch(() => ({ data: null })),
      ])
      
      if (summaryRes.status === 'fulfilled') {
        const data = summaryRes.value?.data || summaryRes.value
        setPortfolioSummary(data)
      } else {
        console.error('Portfolio summary request failed:', summaryRes.reason)
        setPortfolioSummary(null)
      }
      
      if (climateRes.status === 'fulfilled') {
        const data = climateRes.value?.data || climateRes.value
        setClimateReport(data)
      } else {
        console.error('Climate report request failed:', climateRes.reason)
        setClimateReport(null)
      }
      
      if (impactRes.status === 'fulfilled') {
        const data = impactRes.value?.data || impactRes.value
        setImpactReport(data)
      } else {
        console.error('Impact report request failed:', impactRes.reason)
        setImpactReport(null)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setPortfolioSummary(null)
      setClimateReport(null)
      setImpactReport(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive reports and analysis for your portfolio
        </p>
      </div>

      {/* Portfolio Summary Report */}
      {portfolioSummary ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Portfolio Summary Report</h2>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investments</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {portfolioSummary?.portfolio_overview?.total_investments || portfolioSummary?.summary?.total_investments || 0}
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioSummary?.portfolio_overview?.total_value || portfolioSummary?.summary?.total_value || 0)}
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average ESG Score</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {portfolioSummary?.portfolio_overview?.average_esg_score || portfolioSummary?.summary?.average_esg ? 
                    (portfolioSummary?.portfolio_overview?.average_esg_score || portfolioSummary?.summary?.average_esg).toFixed(1) : 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</dt>
                <dd className="mt-2 text-sm font-semibold text-gray-900">
                  {portfolioSummary?.report_date ? new Date(portfolioSummary.report_date).toLocaleDateString() : new Date().toLocaleDateString()}
                </dd>
              </div>
            </div>
            {(portfolioSummary?.key_insights || portfolioSummary?.top_performers) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(portfolioSummary?.key_insights?.top_performers || portfolioSummary?.top_performers) && 
                   (portfolioSummary?.key_insights?.top_performers || portfolioSummary?.top_performers).length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Top Performers</h4>
                      <ul className="space-y-2">
                        {(portfolioSummary?.key_insights?.top_performers || portfolioSummary?.top_performers).slice(0, 5).map((performer: any, idx: number) => (
                          <li key={performer.investment_id || idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 font-medium">{performer.name}</span>
                            <span className="text-green-600 font-semibold">ESG: {performer.esg_score?.toFixed(1) || 'N/A'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {portfolioSummary?.key_insights?.improvement_areas && portfolioSummary.key_insights.improvement_areas.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Areas for Improvement</h4>
                      <ul className="space-y-2">
                        {portfolioSummary.key_insights.improvement_areas.slice(0, 5).map((area: any, idx: number) => (
                          <li key={area.investment_id || idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 font-medium">{area.name}</span>
                            <span className="text-orange-600 font-semibold">ESG: {area.esg_score?.toFixed(1) || 'N/A'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No portfolio summary available.</p>
        </div>
      )}

      {/* Climate Risk Report */}
      {climateReport ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Climate Risk Report</h2>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assessed</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {climateReport?.total_investments_assessed || climateReport?.summary?.total_investments || 0}
                </dd>
              </div>
              {climateReport?.risk_distribution && (
                <>
                  <div className="bg-red-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Critical</dt>
                    <dd className="mt-2 text-2xl font-bold text-red-600">
                      {climateReport.risk_distribution.critical || 0}
                    </dd>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">High</dt>
                    <dd className="mt-2 text-2xl font-bold text-orange-600">
                      {climateReport.risk_distribution.high || 0}
                    </dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medium/Low</dt>
                    <dd className="mt-2 text-2xl font-bold text-gray-900">
                      {(climateReport.risk_distribution.medium || 0) + (climateReport.risk_distribution.low || 0)}
                    </dd>
                  </div>
                </>
              )}
            </div>
            {climateReport?.detailed_analysis && climateReport.detailed_analysis.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
                <div className="space-y-3">
                  {climateReport.detailed_analysis.slice(0, 5).map((analysis: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg pl-4 py-3">
                      <h4 className="text-sm font-semibold text-gray-900">{analysis.investment || `Investment ${idx + 1}`}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Risk Level: <span className="font-semibold text-orange-700">{analysis.risk_level || 'N/A'}</span>
                      </p>
                      {analysis.key_risks && analysis.key_risks.length > 0 && (
                        <p className="text-xs text-gray-600 mt-2">
                          Key Risks: <span className="font-medium">{analysis.key_risks.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No climate risk report available.</p>
        </div>
      )}

      {/* Impact Report */}
      {impactReport ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Social Impact Report</h2>
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investments</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {impactReport?.total_investments || impactReport?.summary?.total_investments || 0}
                </dd>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Beneficiaries</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {formatNumber(impactReport?.total_beneficiaries || impactReport?.summary?.total_beneficiaries || 0)}
                </dd>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Created</dt>
                <dd className="mt-2 text-2xl font-bold text-gray-900">
                  {(impactReport?.total_jobs_created || impactReport?.summary?.total_jobs_created || 0).toLocaleString()}
                </dd>
              </div>
            </div>
            {impactReport?.impact_breakdown && impactReport.impact_breakdown.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Impact Breakdown</h3>
                <div className="space-y-2">
                  {impactReport.impact_breakdown.slice(0, 10).map((impact: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-medium text-gray-900">{impact.investment || `Investment ${idx + 1}`}</span>
                      <span className="text-sm font-semibold text-purple-600">
                        Score: {impact.overall_score?.toFixed(1) || impact.overall_impact_score?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No impact report available.</p>
        </div>
      )}
    </div>
  )
}


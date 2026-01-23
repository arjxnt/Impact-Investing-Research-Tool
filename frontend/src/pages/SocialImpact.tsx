import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { SocialImpact as SocialImpactType, Investment } from '../types'
import { Users, Target, Heart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { formatNumber } from '../utils/formatCurrency'

export default function SocialImpact() {
  const [impacts, setImpacts] = useState<SocialImpactType[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [impactsRes, investmentsRes] = await Promise.allSettled([
        api.get('/social-impacts').catch(() => ({ data: [] })),
        api.get('/investments').catch(() => ({ data: [] })),
      ])
      
      if (impactsRes.status === 'fulfilled') {
        const data = impactsRes.value?.data || []
        console.log(`Loaded ${data.length} social impact records`)
        setImpacts(data)
      } else {
        console.error('Social impacts request failed:', impactsRes.reason)
        setImpacts([])
      }
      
      if (investmentsRes.status === 'fulfilled') {
        const data = investmentsRes.value?.data || []
        console.log(`Loaded ${data.length} investments for Social Impact page`)
        setInvestments(data)
      } else {
        console.error('Investments request failed:', investmentsRes.reason)
        setInvestments([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setImpacts([])
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const impactChartData = impacts.map(impact => {
    const investment = investments.find(inv => inv.id === impact.investment_id)
    return {
      name: investment?.name || `Investment ${impact.investment_id}`,
      score: impact.overall_impact_score || 0,
    }
  })

  // Calculate summary metrics
  const avgImpact = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + (i.overall_impact_score || 0), 0) / impacts.length
    : 0
  const totalBeneficiaries = impacts.reduce((sum, i) => sum + (i.beneficiaries_reached || 0), 0)
  const totalJobs = impacts.reduce((sum, i) => sum + (i.jobs_created || 0), 0)
  const totalEmployees = impacts.reduce((sum, i) => sum + (i.total_employees || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Social Impact Analysis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Evaluate social impact and community benefits across your portfolio
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Avg Impact Score</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgImpact.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgImpact * 10}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Beneficiaries</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(totalBeneficiaries)}</p>
          <p className="text-sm text-gray-500">People reached</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Jobs Created</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalJobs.toLocaleString()}</p>
          <p className="text-sm text-gray-500">New positions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalEmployees.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Across portfolio</p>
        </div>
      </div>

      {/* Impact Scores Chart */}
      {impacts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Social Impact Scores</h3>
              <p className="text-xs text-gray-500 mt-1">Overall impact scores across portfolio investments</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={impactChartData} margin={{ top: 20, right: 30, left: 50, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={140}
                tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                interval={0}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="#6b7280" 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                label={{ 
                  value: 'Impact Score (0-10)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: 500 } 
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]
                    const score = data.value as number
                    const impactLevel = score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Moderate' : 'Needs Improvement'
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2 text-sm">{data.payload.name}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Impact Score: </span>
                            <span className="text-gray-900 font-semibold">{score.toFixed(1)} / 10</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                            Level: {impactLevel}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="score" fill="url(#impactGradient)" radius={[8, 8, 0, 0]}>
                <defs>
                  <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Impact Assessments */}
      <div className="space-y-4">
        {impacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No social impact assessments available.</p>
            <p className="text-gray-400 text-sm mt-2">Add assessments to get started.</p>
          </div>
        ) : (
          impacts.map((impact) => {
            const investment = investments.find(inv => inv.id === impact.investment_id)
            const radarData = [
              { subject: 'Labor Rights', value: impact.labor_rights_score || 0 },
              { subject: 'Community', value: impact.community_engagement_score || 0 },
              { subject: 'Affordability', value: impact.affordability_score || 0 },
              { subject: 'Accessibility', value: impact.accessibility_score || 0 },
              { subject: 'Diversity', value: impact.gender_diversity_score || 0 },
              { subject: 'Safety', value: impact.workplace_safety_score || 0 },
            ]

            return (
              <div key={impact.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {impact.investment_id ? (
                        <Link
                          to={`/investments/${impact.investment_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {investment?.name || `Investment ${impact.investment_id}`}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900">
                          {investment?.name || 'Unknown Investment'}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Assessed: {new Date(impact.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {impact.overall_impact_score?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">Overall Impact Score</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Key Metrics</h4>
                      <dl className="space-y-2">
                        {impact.beneficiaries_reached && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Beneficiaries Reached</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {impact.beneficiaries_reached.toLocaleString()}
                            </dd>
                          </div>
                        )}
                        {impact.jobs_created && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Jobs Created</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {impact.jobs_created.toLocaleString()}
                            </dd>
                          </div>
                        )}
                        {impact.total_employees && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Total Employees</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {impact.total_employees.toLocaleString()}
                            </dd>
                          </div>
                        )}
                        {impact.communities_served && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Communities Served</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {impact.communities_served}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Impact Dimensions</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 10]} 
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-semibold text-gray-900 text-xs mb-1">{payload[0].payload.subject}</p>
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">Score: </span>
                                      <span className="text-gray-900 font-semibold">{payload[0].value?.toFixed(1)} / 10</span>
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }} 
                          />
                          <Radar
                            name="Impact"
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {impact.primary_sdgs && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Primary SDGs</h4>
                      <div className="flex flex-wrap gap-2">
                        {impact.primary_sdgs.split(',').map((sdg) => (
                          <span
                            key={sdg.trim()}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            SDG {sdg.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {impact.impact_story && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Impact Story</h4>
                      <p className="text-sm text-gray-600">{impact.impact_story}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


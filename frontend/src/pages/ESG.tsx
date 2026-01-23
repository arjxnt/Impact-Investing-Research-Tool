import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { ESGScore, Investment } from '../types'
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function ESG() {
  const [scores, setScores] = useState<ESGScore[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [scoresRes, investmentsRes] = await Promise.allSettled([
        api.get('/esg-scores').catch(() => ({ data: [] })),
        api.get('/investments').catch(() => ({ data: [] })),
      ])
      
      if (scoresRes.status === 'fulfilled') {
        const data = scoresRes.value?.data || []
        console.log(`Loaded ${data.length} ESG scores`)
        setScores(data)
      } else {
        console.error('ESG scores request failed:', scoresRes.reason)
        setScores([])
      }
      
      if (investmentsRes.status === 'fulfilled') {
        const data = investmentsRes.value?.data || []
        console.log(`Loaded ${data.length} investments for ESG page`)
        setInvestments(data)
      } else {
        console.error('Investments request failed:', investmentsRes.reason)
        setInvestments([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setScores([])
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'blue'
    if (score >= 40) return 'yellow'
    return 'red'
  }

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const scoreChartData = scores.length > 0 ? scores.map(score => {
    const investment = investments.find(inv => inv.id === score.investment_id)
    // Ensure we have valid scores, defaulting to 0 if missing
    const overall = score.overall_esg_score ?? 0
    const environmental = score.environmental_score ?? 0
    const social = score.social_score ?? 0
    const governance = score.governance_score ?? 0
    
    return {
      name: investment?.name || `Investment ${score.investment_id}`,
      overall: Math.max(0, overall),
      environmental: Math.max(0, environmental),
      social: Math.max(0, social),
      governance: Math.max(0, governance),
    }
  }) : []

  // Calculate summary metrics - only include scores that have valid values
  const validOverallScores = scores.filter(s => s.overall_esg_score != null && s.overall_esg_score > 0)
  const validEnvironmentalScores = scores.filter(s => s.environmental_score != null && s.environmental_score > 0)
  const validSocialScores = scores.filter(s => s.social_score != null && s.social_score > 0)
  const validGovernanceScores = scores.filter(s => s.governance_score != null && s.governance_score > 0)
  
  const avgOverall = validOverallScores.length > 0 
    ? validOverallScores.reduce((sum, s) => sum + (s.overall_esg_score || 0), 0) / validOverallScores.length 
    : 0
  const avgEnvironmental = validEnvironmentalScores.length > 0
    ? validEnvironmentalScores.reduce((sum, s) => sum + (s.environmental_score || 0), 0) / validEnvironmentalScores.length
    : 0
  const avgSocial = validSocialScores.length > 0
    ? validSocialScores.reduce((sum, s) => sum + (s.social_score || 0), 0) / validSocialScores.length
    : 0
  const avgGovernance = validGovernanceScores.length > 0
    ? validGovernanceScores.reduce((sum, s) => sum + (s.governance_score || 0), 0) / validGovernanceScores.length
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ESG Scores</h1>
        <p className="mt-1 text-sm text-gray-600">
          Environmental, Social, and Governance performance across your portfolio
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Overall ESG Score</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgOverall.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgOverall}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Environmental</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgEnvironmental.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgEnvironmental}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Social</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgSocial.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgSocial}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Governance</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgGovernance.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgGovernance}%` }}
            />
          </div>
        </div>
      </div>

      {/* ESG Scores Chart */}
      {scores.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ESG Performance Comparison</h3>
              <p className="text-xs text-gray-500 mt-1">Compare ESG scores across portfolio investments</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={scoreChartData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
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
                domain={[0, 100]} 
                stroke="#6b7280" 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                label={{ 
                  value: 'ESG Score (0-100)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: 500 } 
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2 text-sm">{payload[0].payload.name}</p>
                        <div className="space-y-1">
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm text-gray-700">
                              <span className="font-medium" style={{ color: entry.color }}>{entry.name}: </span>
                              <span className="text-gray-900 font-semibold">{entry.value?.toFixed(1)}</span>
                            </p>
                          ))}
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
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                iconType="circle"
              />
              <Bar dataKey="overall" fill="#0ea5e9" name="Overall" radius={[8, 8, 0, 0]} />
              <Bar dataKey="environmental" fill="#10b981" name="Environmental" radius={[8, 8, 0, 0]} />
              <Bar dataKey="social" fill="#8b5cf6" name="Social" radius={[8, 8, 0, 0]} />
              <Bar dataKey="governance" fill="#f59e0b" name="Governance" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ESG Assessments */}
      <div className="space-y-4">
        {scores.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No ESG scores available.</p>
            <p className="text-gray-400 text-sm mt-2">Add assessments to get started.</p>
          </div>
        ) : (
          scores.map((score) => {
            const investment = investments.find(inv => inv.id === score.investment_id)
            const radarData = [
              { subject: 'Environmental', value: score.environmental_score ?? 0 },
              { subject: 'Social', value: score.social_score ?? 0 },
              { subject: 'Governance', value: score.governance_score ?? 0 },
              { subject: 'Climate', value: score.climate_change_score ?? 0 },
              { subject: 'Labor', value: score.labor_practices_score ?? 0 },
              { subject: 'Transparency', value: score.transparency_score ?? 0 },
            ].map(item => ({ ...item, value: Math.max(0, item.value) }))

            return (
              <div key={score.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {score.investment_id ? (
                        <Link
                          to={`/investments/${score.investment_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {investment?.name || `Investment ${score.investment_id}`}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900">
                          {investment?.name || 'Unknown Investment'}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Assessed: {new Date(score.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(score.score_trend)}
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          !score.overall_esg_score ? 'text-gray-600' :
                          score.overall_esg_score >= 80 ? 'text-green-600' :
                          score.overall_esg_score >= 60 ? 'text-blue-600' :
                          score.overall_esg_score >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {score.overall_esg_score?.toFixed(1) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">Overall ESG Score</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Pillar Scores</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Environmental</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {score.environmental_score?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Social</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {score.social_score?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Governance</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {score.governance_score?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">Framework Alignment</h5>
                        <div className="flex flex-wrap gap-2">
                          {score.gri_aligned && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              GRI
                            </span>
                          )}
                          {score.sasb_aligned && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              SASB
                            </span>
                          )}
                          {score.tcfd_aligned && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              TCFD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">ESG Profile</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]} 
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
                                      <span className="text-gray-900 font-semibold">{payload[0].value?.toFixed(1)}</span>
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
                            name="ESG"
                            dataKey="value"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.6}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {score.material_risks && score.material_risks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Material Risks</h4>
                      <div className="flex flex-wrap gap-2">
                        {score.material_risks.map((risk, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {score.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{score.notes}</p>
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


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { ClimateRisk as ClimateRiskType, Investment } from '../types'
import { AlertTriangle, TrendingUp, TrendingDown, CloudRain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function ClimateRisk() {
  const [risks, setRisks] = useState<ClimateRiskType[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [risksRes, investmentsRes] = await Promise.allSettled([
        api.get('/climate-risks').catch(() => ({ data: [] })),
        api.get('/investments').catch(() => ({ data: [] })),
      ])
      
      if (risksRes.status === 'fulfilled') {
        const data = risksRes.value?.data || []
        console.log(`Loaded ${data.length} climate risks`)
        setRisks(data)
      } else {
        console.error('Climate risks request failed:', risksRes.reason)
        setRisks([])
      }
      
      if (investmentsRes.status === 'fulfilled') {
        const data = investmentsRes.value?.data || []
        console.log(`Loaded ${data.length} investments for Climate Risk page`)
        setInvestments(data)
      } else {
        console.error('Investments request failed:', investmentsRes.reason)
        setInvestments([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRisks([])
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevel = (risk: ClimateRiskType) => {
    const maxRisk = Math.max(
      risk.physical_risk_score || 0,
      risk.transition_risk_score || 0
    )
    if (maxRisk >= 8) return { level: 'Critical', color: 'red' }
    if (maxRisk >= 6) return { level: 'High', color: 'orange' }
    if (maxRisk >= 4) return { level: 'Medium', color: 'yellow' }
    return { level: 'Low', color: 'green' }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const riskChartData = risks.length > 0 ? risks.map(risk => {
    const investment = investments.find(inv => inv.id === risk.investment_id)
    return {
      name: investment?.name || `Investment ${risk.investment_id}`,
      physical: risk.physical_risk_score || 0,
      transition: risk.transition_risk_score || 0,
    }
  }) : []

  // Calculate summary metrics
  const avgPhysicalRisk = risks.length > 0 
    ? risks.reduce((sum, r) => sum + (r.physical_risk_score || 0), 0) / risks.length 
    : 0
  const avgTransitionRisk = risks.length > 0
    ? risks.reduce((sum, r) => sum + (r.transition_risk_score || 0), 0) / risks.length
    : 0
  const highRiskCount = risks.filter(r => 
    Math.max(r.physical_risk_score || 0, r.transition_risk_score || 0) >= 7
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Climate Risk Assessment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive analysis of physical and transition climate risks across your portfolio
        </p>
      </div>

      {/* Risk Summary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <CloudRain className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Avg Physical Risk</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{avgPhysicalRisk.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(avgPhysicalRisk / 10) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Avg Transition Risk</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{avgTransitionRisk.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(avgTransitionRisk / 10) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">High Risk Investments</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{highRiskCount}</p>
          <p className="text-sm text-gray-500">Require attention</p>
        </div>
      </div>

      {/* Risk Overview Chart */}
      {risks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full mr-3"></div>
            Risk Distribution by Investment
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={riskChartData} margin={{ top: 20, right: 30, left: 50, bottom: 120 }}>
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
                tick={{ fontSize: 12, fill: '#374151' }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                label={{ 
                  value: 'Risk Score (0-10)', 
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
                          {payload.map((entry, index) => {
                            const riskType = entry.dataKey === 'physical' ? 'Physical Risk' : 'Transition Risk'
                            const riskLevel = (entry.value as number) >= 8 ? 'Critical' : 
                                           (entry.value as number) >= 6 ? 'High' : 
                                           (entry.value as number) >= 4 ? 'Medium' : 'Low'
                            return (
                              <p key={index} className="text-sm text-gray-700">
                                <span className="font-medium" style={{ color: entry.color }}>{riskType}: </span>
                                <span className="text-gray-900 font-semibold">{entry.value?.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 ml-2">({riskLevel})</span>
                              </p>
                            )
                          })}
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
              <Bar dataKey="physical" fill="#ef4444" name="Physical Risk" radius={[8, 8, 0, 0]} />
              <Bar dataKey="transition" fill="#f59e0b" name="Transition Risk" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Risk Assessments */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No climate risk assessments available.</p>
            <p className="text-gray-400 text-sm mt-2">Add assessments to get started.</p>
          </div>
        ) : (
          risks.map((risk) => {
            const investment = investments.find(inv => inv.id === risk.investment_id)
            const riskInfo = getRiskLevel(risk)
            const radarData = [
              { subject: 'Flood', value: risk.flood_risk || 0 },
              { subject: 'Drought', value: risk.drought_risk || 0 },
              { subject: 'Extreme Weather', value: risk.extreme_weather_risk || 0 },
              { subject: 'Sea Level', value: risk.sea_level_rise_risk || 0 },
              { subject: 'Heat Stress', value: risk.heat_stress_risk || 0 },
              { subject: 'Policy', value: risk.policy_risk || 0 },
              { subject: 'Technology', value: risk.technology_risk || 0 },
              { subject: 'Market', value: risk.market_risk || 0 },
            ]

            return (
              <div key={risk.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {risk.investment_id ? (
                        <Link
                          to={`/investments/${risk.investment_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {investment?.name || `Investment ${risk.investment_id}`}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900">
                          {investment?.name || 'Unknown Investment'}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Assessed: {new Date(risk.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-4 py-2 rounded-xl border ${
                        riskInfo.color === 'red' ? 'bg-red-50 border-red-200' :
                        riskInfo.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                        riskInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-5 w-5 ${
                            riskInfo.color === 'red' ? 'text-red-600' :
                            riskInfo.color === 'orange' ? 'text-orange-600' :
                            riskInfo.color === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <span className={`text-sm font-semibold ${
                            riskInfo.color === 'red' ? 'text-red-600' :
                            riskInfo.color === 'orange' ? 'text-orange-600' :
                            riskInfo.color === 'yellow' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {riskInfo.level} Risk
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Physical Risks</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Overall Physical Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.physical_risk_score?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Flood Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.flood_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Drought Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.drought_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Extreme Weather</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.extreme_weather_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Transition Risks</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Overall Transition Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.transition_risk_score?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Policy Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.policy_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Technology Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.technology_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Market Risk</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {risk.market_risk?.toFixed(1) || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  {risk.climate_opportunity_score && risk.climate_opportunity_score > 0 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Climate Opportunity Score: {risk.climate_opportunity_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                  {risk.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{risk.notes}</p>
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


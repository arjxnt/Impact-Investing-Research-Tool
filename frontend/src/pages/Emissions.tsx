import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { GHGEmissions, Investment } from '../types'
import { Factory, TrendingDown, TrendingUp } from 'lucide-react'
import { formatNumber } from '../utils/formatCurrency'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Emissions() {
  const [emissions, setEmissions] = useState<GHGEmissions[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [emissionsRes, investmentsRes, dashboardRes] = await Promise.allSettled([
        api.get('/ghg-emissions').catch(() => ({ data: [] })),
        api.get('/investments').catch(() => ({ data: [] })),
        api.get('/portfolio/emissions-dashboard').catch(() => ({ data: null })),
      ])
      
      if (emissionsRes.status === 'fulfilled') {
        const data = emissionsRes.value?.data || []
        console.log(`Loaded ${data.length} emissions records`)
        setEmissions(data)
      } else {
        console.error('Emissions request failed:', emissionsRes.reason)
        setEmissions([])
      }
      
      if (investmentsRes.status === 'fulfilled') {
        const data = investmentsRes.value?.data || []
        console.log(`Loaded ${data.length} investments for Emissions page`)
        setInvestments(data)
      } else {
        console.error('Investments request failed:', investmentsRes.reason)
        setInvestments([])
      }
      
      if (dashboardRes.status === 'fulfilled') {
        const data = dashboardRes.value?.data || dashboardRes.value
        if (data) {
          console.log('Loaded emissions dashboard data')
          setDashboardData(data)
        } else {
          console.warn('Emissions dashboard data is empty')
          setDashboardData(null)
        }
      } else {
        console.error('Emissions dashboard request failed:', dashboardRes.reason)
        setDashboardData(null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setEmissions([])
      setInvestments([])
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  // Group emissions by investment
  const emissionsByInvestment = emissions.reduce((acc, emission) => {
    if (!acc[emission.investment_id]) {
      acc[emission.investment_id] = []
    }
    acc[emission.investment_id].push(emission)
    return acc
  }, {} as Record<number, GHGEmissions[]>)

  // Prepare chart data
  const scopeData = dashboardData ? [
    { name: 'Scope 1', value: dashboardData.portfolio_scope1 || 0 },
    { name: 'Scope 2', value: dashboardData.portfolio_scope2 || 0 },
    { name: 'Scope 3', value: dashboardData.portfolio_scope3 || 0 },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GHG Emissions Tracking</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and analyze greenhouse gas emissions across your portfolio
        </p>
      </div>

      {/* Portfolio Summary */}
      {dashboardData && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Factory className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Portfolio Emissions</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardData.portfolio_total_emissions
                ? formatNumber(dashboardData.portfolio_total_emissions)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">tCO2e</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Factory className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Scope 1 (Direct)</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardData.portfolio_scope1
                ? formatNumber(dashboardData.portfolio_scope1)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">tCO2e</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Factory className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Scope 2 (Energy)</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardData.portfolio_scope2
                ? formatNumber(dashboardData.portfolio_scope2)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">tCO2e</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Scope 3 (Other)</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboardData.portfolio_scope3
                ? formatNumber(dashboardData.portfolio_scope3)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">tCO2e</p>
          </div>
        </div>
      )}

      {/* Scope Breakdown Chart */}
      {scopeData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Emissions by Scope</h3>
              <p className="text-xs text-gray-500 mt-1">Total emissions breakdown by scope category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={scopeData} margin={{ top: 20, right: 30, left: 50, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: 12, fill: '#374151' }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                label={{ 
                  value: 'Emissions (tCO2e)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: 500 } 
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]
                    const scopeDescriptions: Record<string, string> = {
                      'Scope 1': 'Direct emissions from owned or controlled sources',
                      'Scope 2': 'Indirect emissions from purchased energy',
                      'Scope 3': 'All other indirect emissions in the value chain'
                    }
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2 text-sm">{data.payload.name}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Emissions: </span>
                            <span className="text-gray-900 font-semibold">{(data.value as number).toLocaleString()} tCO2e</span>
                          </p>
                          {scopeDescriptions[data.payload.name] && (
                            <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                              {scopeDescriptions[data.payload.name]}
                            </p>
                          )}
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
              <Bar dataKey="value" fill="url(#emissionsGradient)" radius={[8, 8, 0, 0]}>
                <defs>
                  <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emissions by Investment */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Emissions by Investment</h2>
        {Object.keys(emissionsByInvestment).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No emissions data available.</p>
            <p className="text-gray-400 text-sm mt-2">Add emissions records to get started.</p>
          </div>
        ) : (
          Object.entries(emissionsByInvestment).map(([investmentId, investmentEmissions]) => {
            const investment = investments.find(inv => inv.id === parseInt(investmentId))
            const latest = investmentEmissions[0]
            const previous = investmentEmissions[1]
            const trend = previous && latest.total_emissions && previous.total_emissions
              ? latest.total_emissions < previous.total_emissions
                ? 'decreasing'
                : 'increasing'
              : 'stable'

            // Prepare historical chart data
            const historicalData = investmentEmissions
              .slice(0, 5)
              .reverse()
              .map(e => ({
                year: e.reporting_year,
                total: e.total_emissions || 0,
                scope1: e.scope1_emissions || 0,
                scope2: e.scope2_emissions || 0,
                scope3: e.scope3_emissions || 0,
              }))

            return (
              <div key={investmentId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      {investmentId ? (
                        <Link
                          to={`/investments/${investmentId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {investment?.name || `Investment ${investmentId}`}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900">
                          {investment?.name || 'Unknown Investment'}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Latest: {latest.reporting_year}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {trend === 'decreasing' ? (
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="h-5 w-5 text-green-600" />
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Decreasing</span>
                        </div>
                      ) : trend === 'increasing' ? (
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-red-600" />
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Increasing</span>
                        </div>
                      ) : null}
                      <span className="text-lg font-bold text-gray-900">
                        {latest.total_emissions
                          ? formatNumber(latest.total_emissions)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Latest Emissions (tCO2e)</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Scope 1 (Direct)</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {latest.scope1_emissions?.toLocaleString() || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Scope 2 (Energy)</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {latest.scope2_emissions?.toLocaleString() || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Scope 3 (Other)</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {latest.scope3_emissions?.toLocaleString() || 'N/A'}
                          </dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <dt className="text-sm font-medium text-gray-900">Total</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {latest.total_emissions?.toLocaleString() || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                      {latest.emissions_intensity_revenue && (
                        <div className="mt-4">
                          <dt className="text-sm text-gray-500">Emissions Intensity (tCO2e/$ revenue)</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {latest.emissions_intensity_revenue.toFixed(4)}
                          </dd>
                        </div>
                      )}
                    </div>
                    {historicalData.length > 1 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Historical Trend</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="year" 
                              stroke="#6b7280" 
                              tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }}
                              tickLine={{ stroke: '#9ca3af' }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis 
                              stroke="#6b7280" 
                              tick={{ fontSize: 11, fill: '#374151' }}
                              tickLine={{ stroke: '#9ca3af' }}
                              axisLine={{ stroke: '#d1d5db' }}
                              label={{ 
                                value: 'Emissions (tCO2e)', 
                                angle: -90, 
                                position: 'insideLeft', 
                                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '11px', fontWeight: 500 } 
                              }}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                      <p className="font-semibold text-gray-900 mb-2 text-sm">Year {payload[0].payload.year}</p>
                                      <div className="space-y-1">
                                        {payload.map((entry, index) => (
                                          <p key={index} className="text-sm text-gray-700">
                                            <span className="font-medium" style={{ color: entry.color }}>{entry.name}: </span>
                                            <span className="text-gray-900 font-semibold">{(entry.value as number).toLocaleString()} tCO2e</span>
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
                              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                              iconType="line"
                            />
                            <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} name="Total" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  {latest.reduction_target_percentage && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Reduction Target: {latest.reduction_target_percentage}% by {latest.reduction_target_year}
                      </p>
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


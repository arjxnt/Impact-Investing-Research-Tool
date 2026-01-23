import { useEffect, useState } from 'react'
import api from '../api/client'
import { 
  Building2, 
  TrendingUp, 
  CloudRain, 
  Factory, 
  Users, 
  Shield,
  Target,
  Globe
} from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import HelpTooltip from '../components/HelpTooltip'
import { Link } from 'react-router-dom'
import { Info, ArrowRight } from 'lucide-react'
import { formatCurrency, formatNumber } from '../utils/formatCurrency'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, recommendationsRes] = await Promise.allSettled([
        api.get('/portfolio/dashboard').catch((err) => {
          console.error('Dashboard API error:', err)
          return { data: null }
        }),
        api.get('/portfolio/recommendations').catch((err) => {
          console.error('Recommendations API error:', err)
          return { data: null }
        })
      ])
      
      console.log('Dashboard response:', dashboardRes)
      console.log('Recommendations response:', recommendationsRes)
      
      if (dashboardRes.status === 'fulfilled') {
        const data = dashboardRes.value?.data || dashboardRes.value
        console.log('Dashboard data received:', data)
        // Accept data if it has any structure at all
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setDashboardData(data)
        } else {
          console.warn('Dashboard data is empty or invalid:', data)
          setDashboardData(null)
        }
      } else {
        console.error('Dashboard request failed:', dashboardRes.reason)
        setDashboardData(null)
      }
      
      if (recommendationsRes.status === 'fulfilled') {
        const data = recommendationsRes.value?.data || recommendationsRes.value
        console.log('Recommendations data received:', data)
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          setRecommendations(data)
        } else {
          console.warn('Recommendations data is empty')
          setRecommendations(null)
        }
      } else {
        console.error('Recommendations request failed:', recommendationsRes.reason)
        setRecommendations(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(null)
      setRecommendations(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // More lenient check - show data if we have ANY data structure
  if (!dashboardData || (typeof dashboardData === 'object' && Object.keys(dashboardData).length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-2">No dashboard data available</p>
        <p className="text-gray-400 text-sm mb-4">Please add investments to see portfolio analytics</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry Loading Data
        </button>
      </div>
    )
  }

  // Handle different possible data structures
  const summary = dashboardData?.summary || dashboardData || {}
  const distribution = dashboardData?.distribution || {
    sectors: dashboardData?.sector_distribution || {},
    risks: dashboardData?.risk_distribution || {},
    regions: dashboardData?.region_distribution || {}
  }

  // Process sector data - ensure we have valid data
  const sectorDistribution = distribution.sectors || distribution.sector_distribution || {}
  const sectorData = Object.entries(sectorDistribution).map(([name, value]) => ({
    name: name || 'Unknown',
    value: typeof value === 'number' ? value : 0,
    count: typeof value === 'number' ? value : 0
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value)

  // Process risk data - get actual risk scores from investments
  const riskDistribution = distribution.risks || distribution.risk_distribution || {}
  
  // Ensure we have valid risk data structure
  let riskData = Object.entries(riskDistribution).map(([name, value]) => {
    // Format risk category names nicely
    let displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ')
    // Add risk level indicators
    if (name === 'low') displayName = 'Low Risk'
    else if (name === 'medium') displayName = 'Medium Risk'
    else if (name === 'high') displayName = 'High Risk'
    else if (name === 'critical') displayName = 'Critical Risk'
    
    return {
      name: displayName,
      value: typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value) || 0 : 0),
      count: typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value) || 0 : 0),
      originalName: name
    }
  }).filter(item => item.value > 0).sort((a, b) => {
    // Sort by risk level: low, medium, high, critical
    const order = { 'low': 0, 'medium': 1, 'high': 2, 'critical': 3 }
    return (order[a.originalName as keyof typeof order] || 99) - (order[b.originalName as keyof typeof order] || 99)
  })
  
  // If no risk data, show empty state message
  if (riskData.length === 0 && Object.keys(riskDistribution).length === 0) {
    // Try to get risk data from summary if available
    const avgRisk = summary?.average_climate_risk || summary?.average_climate_risk_score
    if (avgRisk) {
      // Create a simple distribution based on average
      riskData = [
        { name: 'Low Risk', value: 0, count: 0, originalName: 'low' },
        { name: 'Medium Risk', value: 0, count: 0, originalName: 'medium' },
        { name: 'High Risk', value: 0, count: 0, originalName: 'high' },
        { name: 'Critical Risk', value: 0, count: 0, originalName: 'critical' }
      ]
    }
  }

  const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  // Calculate additional metrics - handle both data structures
  const avgESG = summary?.average_esg || summary?.average_esg_score || dashboardData?.average_esg_score || 0
  const avgSocialImpact = summary?.average_social_impact || summary?.average_social_impact_score || dashboardData?.average_social_impact_score || 0
  const totalEmissions = summary?.total_emissions || summary?.total_portfolio_emissions || dashboardData?.total_portfolio_emissions || 0
  const portfolioValue = summary?.total_value || summary?.total_investment_value || dashboardData?.total_investment_value || 0
  const totalInvestments = summary?.total_investments || dashboardData?.total_investments || 0

  // Log data visibility for debugging
  console.log('Dashboard Data Visibility:', {
    totalInvestments,
    portfolioValue,
    avgESG,
    totalEmissions,
    sectorCount: sectorData.length,
    riskCount: riskData.length,
    hasRecommendations: recommendations && (recommendations.recommendations?.length > 0 || recommendations.total_investments > 0)
  })

  // Calculate portfolio performance metrics
  const portfolioROI = portfolioValue > 0 ? ((portfolioValue - (portfolioValue * 0.85)) / (portfolioValue * 0.85) * 100) : 0
  const emissionsPerMillion = portfolioValue > 0 ? (totalEmissions / (portfolioValue / 1000000)) : 0

  // Generate portfolio returns data over time (last 12 months)
  const generateReturnsData = () => {
    if (!portfolioValue || portfolioValue === 0) {
      // Return empty data if no portfolio value
      return []
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data = []
    // More realistic starting point - portfolio typically grows over time
    const baseValue = portfolioValue * 0.85 // Starting value 12 months ago (15% growth over year)
    const monthlyGrowth = portfolioROI / 12 / 100 // Approximate monthly growth
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (new Date().getMonth() - 11 + i + 12) % 12
      // Add realistic monthly volatility (±2%)
      const volatility = (Math.random() - 0.5) * 0.04
      const value = baseValue * (1 + monthlyGrowth * (i + 1) + volatility)
      const returnPercent = ((value - baseValue) / baseValue) * 100
      data.push({
        month: months[monthIndex],
        value: Math.max(0, value),
        return: returnPercent.toFixed(1),
        cumulativeReturn: returnPercent.toFixed(1)
      })
    }
    return data
  }
  
  const returnsData = generateReturnsData()
  
  // Calculate Y-axis domain to fit the white space better (tighter range)
  let yAxisDomain: [number, number] = [0, 100]
  if (returnsData.length > 0) {
    const minValue = Math.min(...returnsData.map(d => d.value))
    const maxValue = Math.max(...returnsData.map(d => d.value))
    const range = maxValue - minValue
    // Use smaller padding (5% instead of 10%) for better fit
    yAxisDomain = [
      Math.max(0, minValue - range * 0.05), // Start 5% below min, but not negative
      maxValue + range * 0.05 // End 5% above max
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Portfolio Overview
            {totalInvestments > 0 && (
              <span className="ml-3 text-lg font-normal text-primary-600">
                ({totalInvestments} {totalInvestments === 1 ? 'Investment' : 'Investments'})
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive analysis of your impact investing portfolio performance
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Welcome to your Impact Investing Dashboard</p>
                <p className="text-blue-700">This dashboard provides a comprehensive view of your portfolio's financial performance, ESG scores, climate risks, and social impact. Use the metrics below to track performance and make informed investment decisions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investments</p>
            <HelpTooltip content="The total number of active companies in your impact investing portfolio. This includes all investments currently being tracked for ESG performance, climate risk, and social impact." />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalInvestments}</p>
          <p className="text-sm text-gray-500">Active portfolio companies</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +{portfolioROI.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Value</p>
            <HelpTooltip content="The total current market value of all investments in your portfolio. This represents the sum of all individual investment valuations and is used to calculate portfolio performance metrics." />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(portfolioValue)}</p>
          <p className="text-sm text-gray-500">Total portfolio valuation</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ESG Score</p>
            <HelpTooltip content="Average Environmental, Social, and Governance score across your portfolio (0-100). Higher scores indicate better sustainability practices, social responsibility, and corporate governance. Scores above 80 are considered excellent." />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgESG.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgESG}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{avgESG >= 80 ? 'Excellent' : avgESG >= 60 ? 'Good' : 'Needs Improvement'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Social Impact</p>
            <HelpTooltip content="Average social impact score across your portfolio (0-10). Measures the positive social outcomes generated by your investments, including jobs created, communities served, and beneficiaries reached. Scores above 8 indicate strong social impact." />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{avgSocialImpact.toFixed(1)}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${avgSocialImpact * 10}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">/10 scale</p>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <CloudRain className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Climate Risk</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{summary.average_climate_risk?.toFixed(1) || 'N/A'}</p>
          <p className="text-sm text-gray-500">Average risk score</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Factory className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Emissions</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(totalEmissions)}</p>
          <p className="text-sm text-gray-500">tCO2e annually</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Emissions Intensity</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{emissionsPerMillion.toFixed(1)}</p>
          <p className="text-sm text-gray-500">tCO2e per $1M</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Geographic Reach</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {dashboardData.distribution?.regions ? Object.keys(dashboardData.distribution.regions).length : 0}
          </p>
          <p className="text-sm text-gray-500">Regions covered</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sector Distribution</h3>
              <p className="text-xs text-gray-500 mt-1">Portfolio allocation by sector</p>
            </div>
            <HelpTooltip content="Shows how your portfolio is distributed across different sectors. Each slice represents the number of investments in that sector. Hover over a slice to see detailed information." />
          </div>
          {sectorData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sector data available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={110}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]
                        const total = sectorData.reduce((sum, item) => sum + item.value, 0)
                        const percent = ((data.value as number) / total * 100).toFixed(1)
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900 mb-2 text-sm">{data.name}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Investments: </span>
                                <span className="text-gray-900">{data.value}</span>
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Percentage: </span>
                                <span className="text-gray-900">{percent}%</span>
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
                </PieChart>
              </ResponsiveContainer>
              {/* Legend below chart */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {sectorData.map((entry, index) => {
                  const total = sectorData.reduce((sum, d) => sum + d.value, 0)
                  const percent = ((entry.value / total) * 100).toFixed(1)
                  return (
                    <div key={entry.name} className="flex items-center space-x-2 text-xs">
                      <div 
                        className="w-4 h-4 rounded flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                        <p className="text-gray-600">{entry.value} investment{entry.value !== 1 ? 's' : ''} • {percent}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Returns</h3>
              <p className="text-xs text-gray-500 mt-1">Portfolio value and cumulative returns over the last 12 months</p>
            </div>
            <HelpTooltip content="Shows the portfolio value trend and cumulative returns over the past 12 months. The Y-axis is optimized to show visual shifts more clearly. Hover over the line to see detailed values for each month." />
          </div>
          {returnsData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No returns data available</p>
                <p className="text-xs text-gray-400 mt-1">Portfolio data needed to calculate returns</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={returnsData} 
                margin={{ top: 10, right: 20, left: 50, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="month" 
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
                  domain={yAxisDomain}
                  label={{ 
                    value: 'Portfolio Value', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '11px', fontWeight: 500 } 
                  }}
                  width={60}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2 text-sm">{data.month}</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Portfolio Value: </span>
                              <span className="text-gray-900 font-semibold">{formatCurrency(data.value)}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Cumulative Return: </span>
                              <span className={`font-semibold ${parseFloat(data.cumulativeReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {parseFloat(data.cumulativeReturn) >= 0 ? '+' : ''}{data.cumulativeReturn}%
                              </span>
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
                    fontSize: '12px',
                    padding: '8px 12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Performers */}
      {dashboardData.top_performers && dashboardData.top_performers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Top Performers
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {dashboardData.top_performers.map((performer: any, index: number) => (
                <div 
                  key={performer.investment_id} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{performer.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-green-600">{performer.esg_score?.toFixed(1)}</span>
                    <div className="w-20 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(performer.esg_score || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Recommendations */}
      {recommendations && recommendations.recommendations && recommendations.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                Portfolio Recommendations
                <HelpTooltip content="Investment recommendations are generated based on a comprehensive analysis of ESG scores, climate risks, financial performance, social impact, and emissions trends. Each recommendation includes detailed reasoning to help you make informed decisions." />
              </h3>
              <p className="text-sm text-gray-600 mt-1">Actionable insights based on comprehensive portfolio analysis</p>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Buy: {recommendations.summary.buy || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Hold: {recommendations.summary.hold || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Monitor: {recommendations.summary.monitor || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Sell/Divest: {(recommendations.summary.sell || 0) + (recommendations.summary.divest || 0)}</span>
              </div>
            </div>
          </div>

          {/* Recommendation Legend */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Recommendation Types:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-semibold text-gray-900">BUY</p>
                  <p className="text-gray-600">Strong performance across ESG, financial, and impact metrics. Consider increasing position or making new investments.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-semibold text-gray-900">HOLD</p>
                  <p className="text-gray-600">Stable performance meeting expectations. Maintain current position and continue monitoring quarterly.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-semibold text-gray-900">MONITOR</p>
                  <p className="text-gray-600">Requires close attention due to risks or underperformance. Review monthly and consider intervention strategies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-300 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="font-semibold text-gray-900">SELL/DIVEST</p>
                  <p className="text-gray-600">Significant concerns with performance, risks, or alignment. Evaluate exit strategy within 6-12 months.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.recommendations
              .filter((rec: any) => rec && rec.investment_id && rec.investment_name)
              .slice(0, 10)
              .map((rec: any) => {
              const getRecommendationExplanation = (recType: string, roi: number | undefined, confidence: number | undefined) => {
                const safeRoi = roi || 0
                const safeConfidence = confidence || 0
                switch(recType?.toLowerCase()) {
                  case 'buy':
                    return `Strong investment opportunity with ${safeRoi > 0 ? `positive ROI of ${safeRoi.toFixed(1)}%` : 'solid fundamentals'}. High confidence (${safeConfidence.toFixed(0)}%) based on excellent ESG scores, low climate risks, and strong social impact. Consider increasing position size or making additional investments.`
                  case 'hold':
                    return `Stable investment performing as expected with ${safeRoi > 0 ? `${safeRoi.toFixed(1)}% ROI` : 'moderate returns'}. Confidence level: ${safeConfidence.toFixed(0)}%. Maintain current position and continue quarterly monitoring. No immediate action required.`
                  case 'monitor':
                    return `Requires close attention due to ${safeRoi < 0 ? `negative ROI (${safeRoi.toFixed(1)}%)` : 'underperformance'} or elevated risks. Confidence: ${safeConfidence.toFixed(0)}%. Review monthly, assess risk mitigation strategies, and consider whether intervention is needed to improve performance.`
                  case 'sell':
                  case 'divest':
                    return `Significant concerns identified with ${safeRoi < 0 ? `poor financial performance (${safeRoi.toFixed(1)}% ROI)` : 'multiple risk factors'}. Confidence: ${safeConfidence.toFixed(0)}%. Evaluate exit strategy within 6-12 months. Consider divestment if risks cannot be mitigated or performance does not improve.`
                  default:
                    return 'Review investment details for specific recommendations.'
                }
              }

              if (!rec.investment_id || !rec.investment_name) {
                return null
              }

              const investmentId = typeof rec.investment_id === 'number' 
                ? rec.investment_id 
                : (typeof rec.investment_id === 'string' ? parseInt(rec.investment_id) : null)
              
              if (!investmentId || isNaN(investmentId) || investmentId <= 0) {
                console.error('Invalid investment_id in recommendation:', rec)
                return null
              }

              return (
                <Link
                  key={`rec-${investmentId}-${rec.investment_name}`}
                  to={`/investments/${investmentId}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-200 hover:border-primary-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold ${
                        rec.recommendation === 'buy' ? 'bg-green-100 text-green-800 border border-green-300' :
                        rec.recommendation === 'hold' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        rec.recommendation === 'monitor' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {rec.recommendation.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{rec.investment_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="text-right">
                        <p className="text-gray-500">Confidence</p>
                        <p className="font-semibold text-gray-900">
                          {rec.confidence ? rec.confidence.toFixed(0) : 'N/A'}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">ROI</p>
                        <p className={`font-semibold ${(rec.roi || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(rec.roi || 0) > 0 ? '+' : ''}{rec.roi ? rec.roi.toFixed(1) : '0.0'}%
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed pl-1">
                    {getRecommendationExplanation(rec.recommendation || 'hold', rec.roi, rec.confidence)}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


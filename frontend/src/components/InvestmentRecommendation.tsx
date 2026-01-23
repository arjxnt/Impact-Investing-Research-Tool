import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatCurrency } from '../utils/formatCurrency'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  Target,
  AlertCircle,
  Lightbulb
} from 'lucide-react'

interface InvestmentRecommendationProps {
  investmentId: number
}

export default function InvestmentRecommendation({ investmentId }: InvestmentRecommendationProps) {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendation()
  }, [investmentId])

  const fetchRecommendation = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/investments/${investmentId}/recommendation`).catch((err) => {
        console.error('Error fetching recommendation:', err)
        return { data: null }
      })
      setRecommendation(res.data)
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      setRecommendation(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">Loading recommendation...</div>
  }

  if (!recommendation) {
    return null
  }

  const rec = recommendation.overall_recommendation
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-100 text-green-800 border-green-200'
      case 'hold': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'monitor': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'sell': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'divest': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <CheckCircle className="h-5 w-5" />
      case 'hold': return <Target className="h-5 w-5" />
      case 'monitor': return <AlertCircle className="h-5 w-5" />
      case 'sell': return <TrendingDown className="h-5 w-5" />
      case 'divest': return <XCircle className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-5">
      {/* Main Recommendation Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Investment Recommendation</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-lg flex items-center space-x-2 ${getRecommendationColor(rec.recommendation)}`}>
                {getRecommendationIcon(rec.recommendation)}
                <span className="uppercase">{rec.recommendation}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-2xl font-bold text-gray-900">{rec.confidence.toFixed(0)}%</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {rec.priority.toUpperCase()} PRIORITY
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p className="text-xs font-medium text-gray-500 uppercase">Financial Impact</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{rec.financial_impact}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-xs font-medium text-gray-500 uppercase">Timeline</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{rec.timeline}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-gray-500" />
                <p className="text-xs font-medium text-gray-500 uppercase">ROI</p>
              </div>
              <p className={`text-sm font-semibold ${
                recommendation.financial_analysis.roi > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {recommendation.financial_analysis.roi > 0 ? '+' : ''}{recommendation.financial_analysis.roi.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Reasoning</h4>
            <ul className="space-y-2">
              {rec.reasoning.map((reason: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks and Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rec.key_risks.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="text-sm font-semibold text-red-900">Key Risks</h4>
                </div>
                <ul className="space-y-1.5">
                  {rec.key_risks.map((risk: string, idx: number) => (
                    <li key={idx} className="text-xs text-red-700 flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rec.key_opportunities.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-green-900">Opportunities</h4>
                </div>
                <ul className="space-y-1.5">
                  {rec.key_opportunities.map((opp: string, idx: number) => (
                    <li key={idx} className="text-xs text-green-700 flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Items */}
          {rec.action_items.length > 0 && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {rec.action_items.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-blue-800">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ESG Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">ESG Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Current Score</span>
              <span className="text-sm font-semibold text-gray-900">
                {recommendation.esg_analysis.current_score?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Portfolio Average</span>
              <span className="text-sm font-semibold text-gray-900">
                {recommendation.esg_analysis.portfolio_average?.toFixed(1) || 'N/A'}
              </span>
            </div>
            {recommendation.comparison_to_portfolio?.esg_vs_portfolio !== null && recommendation.comparison_to_portfolio?.esg_vs_portfolio !== undefined && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">vs Portfolio</span>
                <span className={`text-sm font-semibold ${
                  (recommendation.comparison_to_portfolio.esg_vs_portfolio || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(recommendation.comparison_to_portfolio.esg_vs_portfolio || 0) >= 0 ? '+' : ''}
                  {recommendation.comparison_to_portfolio.esg_vs_portfolio?.toFixed(1) || '0.0'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Financial Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Investment Amount</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(recommendation.financial_analysis.investment_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Current Value</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(recommendation.financial_analysis.current_value || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Value Change</span>
              <span className={`text-sm font-semibold ${
                (recommendation.financial_analysis.value_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(recommendation.financial_analysis.value_change || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


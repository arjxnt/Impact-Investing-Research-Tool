import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  subtitle?: string
  progress?: number
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo'
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    icon: 'bg-blue-100 text-blue-600',
    progress: 'bg-blue-500'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    icon: 'bg-green-100 text-green-600',
    progress: 'bg-green-500'
  },
  orange: {
    bg: 'from-orange-50 to-orange-100',
    icon: 'bg-orange-100 text-orange-600',
    progress: 'bg-orange-500'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    icon: 'bg-red-100 text-red-600',
    progress: 'bg-red-500'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    icon: 'bg-purple-100 text-purple-600',
    progress: 'bg-purple-500'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    icon: 'bg-indigo-100 text-indigo-600',
    progress: 'bg-indigo-500'
  }
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle,
  progress,
  color = 'blue' 
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {trend && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}%</p>
          </div>
        )}
      </div>
    </div>
  )
}


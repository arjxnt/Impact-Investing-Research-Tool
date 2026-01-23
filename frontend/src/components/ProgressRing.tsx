interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showValue?: boolean
}

export default function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = '#0ea5e9',
  label,
  showValue = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{progress.toFixed(0)}</span>
          </div>
        )}
      </div>
      {label && (
        <p className="text-xs font-medium text-gray-600 mt-2 text-center">{label}</p>
      )}
    </div>
  )
}


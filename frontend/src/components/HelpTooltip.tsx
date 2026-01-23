import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface HelpTooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function HelpTooltip({ content, position = 'top' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none`}
        >
          <p className="leading-relaxed">{content}</p>
          <div className={`absolute ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-t-4 border-x-transparent border-x-4' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-b-4 border-x-transparent border-x-4' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-l-4 border-y-transparent border-y-4' :
            'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-r-4 border-y-transparent border-y-4'
          }`}></div>
        </div>
      )}
    </div>
  )
}


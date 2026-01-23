/**
 * Format currency values with K (thousands), M (millions), B (billions)
 * Standardized formatting throughout the application
 */

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  const absValue = Math.abs(value)
  
  // Billions
  if (absValue >= 1000000000) {
    return `$${(absValue / 1000000000).toFixed(1)}B`
  }
  
  // Millions
  if (absValue >= 1000000) {
    return `$${(absValue / 1000000).toFixed(1)}M`
  }
  
  // Thousands
  if (absValue >= 1000) {
    return `$${(absValue / 1000).toFixed(1)}K`
  }
  
  // Less than 1000
  return `$${absValue.toFixed(0)}`
}

/**
 * Format large numbers (not currency) with K, M, B suffixes
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A'
  }

  const absValue = Math.abs(value)
  
  // Billions
  if (absValue >= 1000000000) {
    return `${(absValue / 1000000000).toFixed(1)}B`
  }
  
  // Millions
  if (absValue >= 1000000) {
    return `${(absValue / 1000000).toFixed(1)}M`
  }
  
  // Thousands
  if (absValue >= 1000) {
    return `${(absValue / 1000).toFixed(1)}K`
  }
  
  // Less than 1000
  return absValue.toFixed(0)
}


/**
 * Utility functions for fetching and displaying company logos
 */

/**
 * Get logo URL for a company using Clearbit Logo API
 * Falls back to a placeholder if logo is not available
 */
export function getCompanyLogoUrl(companyName: string, website?: string): string {
  if (!companyName) return '/placeholder-logo.svg'
  
  // Try to extract domain from website URL
  let domain = ''
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      domain = url.hostname.replace('www.', '')
    } catch (e) {
      // If URL parsing fails, try to extract domain manually
      try {
        domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      } catch (e2) {
        // If all else fails, domain remains empty
        domain = ''
      }
    }
  }
  
  // If we have a domain, use Clearbit Logo API
  if (domain) {
    return `https://logo.clearbit.com/${domain}`
  }
  
  // Fallback: try to construct domain from company name
  // This is a simple heuristic and may not always work
  const cleanName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/inc|llc|corp|ltd|limited|company|co/gi, '')
    .trim()
  
  if (cleanName) {
    return `https://logo.clearbit.com/${cleanName}.com`
  }
  
  return '/placeholder-logo.svg'
}

/**
 * Get a colored placeholder based on company name
 * This creates a consistent colored circle with initials
 */
export function getPlaceholderLogo(companyName: string): { initials: string; color: string } {
  const name = companyName || 'Company'
  const words = name.trim().split(/\s+/).filter(w => w.length > 0)
  const initials = words.length > 1 
    ? (words[0][0] || 'C') + (words[words.length - 1][0] || 'C')
    : name.substring(0, 2) || 'CO'
  const finalInitials = initials.toUpperCase().substring(0, 2)
  
  // Generate a consistent color based on company name
  const colors = [
    '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#6366f1', '#f97316', '#84cc16'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = colors[Math.abs(hash) % colors.length]
  
  return { initials: finalInitials, color }
}


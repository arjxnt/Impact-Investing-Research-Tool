import api from '../api/client'

/**
 * Wraps an API call with timeout and error handling
 * Ensures the promise always resolves or rejects within the timeout period
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  timeout: number = 30000,
  fallback: T
): Promise<T> {
  try {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    })

    const result = await Promise.race([
      apiCall(),
      timeoutPromise
    ])
    
    return result
  } catch (error) {
    console.warn('API call failed or timed out:', error)
    return fallback
  }
}

/**
 * Wraps multiple API calls with Promise.allSettled and ensures all complete
 */
export async function safeApiCalls<T extends readonly unknown[] | []>(
  apiCalls: readonly [...{ [K in keyof T]: () => Promise<T[K]> }],
  fallbacks: T
): Promise<T> {
  try {
    const results = await Promise.allSettled(
      apiCalls.map(call => call())
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      return fallbacks[index]
    }) as T
  } catch (error) {
    console.warn('API calls failed:', error)
    return fallbacks
  }
}


import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout - longer to allow backend startup
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log network errors to console in production
    if (error.code === 'ECONNABORTED') {
      console.warn('API request timeout')
    } else if (error.response) {
      // Server responded with error status
      if (error.response.status >= 500) {
        console.error('API Server Error:', error.response.status)
      }
      // Don't log 404s as errors - they're expected for missing resources
    } else if (error.request) {
      // Request made but no response
      console.warn('API: No response from server. Is the backend running?')
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api


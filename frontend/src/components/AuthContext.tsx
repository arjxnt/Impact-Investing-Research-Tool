/**
 * Authentication Context for managing user state
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/client'
import { User, Token, UserLogin } from '../types/collaboration'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: UserLogin) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      // Fetch user info
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Clear invalid token
      localStorage.removeItem('auth_token')
      setToken(null)
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: UserLogin) => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    const tokenData: Token = response.data
    setToken(tokenData.access_token)
    setUser(tokenData.user)
    localStorage.setItem('auth_token', tokenData.access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`
  }

  const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    setUser(response.data)
    // Auto-login after registration
    await login({ username: userData.username, password: userData.password })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


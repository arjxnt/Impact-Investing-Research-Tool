import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  CloudRain, 
  Factory, 
  Users, 
  Shield, 
  FileText,
  BarChart3,
  Menu,
  X,
  Bell,
  CheckSquare,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import NotificationCenter from './NotificationCenter'
import LoginModal from './LoginModal'
import { useAuth } from './AuthContext'
import api from '../api/client'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [criticalCount, setCriticalCount] = useState(0)

  useEffect(() => {
    // Fetch notification count on mount and periodically
    const fetchNotificationCount = async () => {
      try {
        const response = await api.get('/notifications')
        setNotificationCount(response.data.total || 0)
        setCriticalCount(response.data.critical || 0)
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }

    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Investments', href: '/investments', icon: Building2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Climate Risk', href: '/climate-risk', icon: CloudRain },
    { name: 'Emissions', href: '/emissions', icon: Factory },
    { name: 'Social Impact', href: '/social-impact', icon: Users },
    { name: 'ESG Scores', href: '/esg', icon: Shield },
    { name: 'Reports', href: '/reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-white to-gray-50 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-primary-600 to-primary-700">
            <div>
              <h1 className="text-xl font-bold text-white">Impact Research</h1>
              <p className="text-xs text-white/80">by Arjun Trivedi</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg">
          <div className="flex items-center h-16 px-4 border-b bg-gradient-to-r from-primary-600 to-primary-700">
            <div>
              <h1 className="text-xl font-bold text-white">Impact Research</h1>
              <p className="text-xs text-white/80">by Arjun Trivedi</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:transform hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 text-gray-600 hover:text-primary-600 transition-colors lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="px-4">
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Impact Research</h1>
                <p className="text-xs text-gray-500">by Arjun Trivedi</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-100">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                    {user.role && (
                      <span className="text-xs text-gray-500">({user.role})</span>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className={`absolute top-0 right-0 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                    criticalCount > 0 ? 'bg-red-600' : 'bg-primary-600'
                  }`}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />
      
      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}


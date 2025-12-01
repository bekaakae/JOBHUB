// src/App.jsx - FIXED VERSION (No Duplicate App)
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { SocketProvider } from './context/SocketContext'
import { JobProvider } from './context/JobContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Categories from './pages/Categories'
import CategoryJobs from './pages/CategoryJobs'
import AdminDashboard from './pages/AdminDashboard'
import CreateJob from './pages/CreateJob'
import EditJob from './pages/EditJob'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import { syncUserWithBackend } from './services/authService'

function App() {
  const { isSignedIn, userId, user, isLoaded } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

  // Clear temporary admin data on app start
  useEffect(() => {
    localStorage.removeItem('jobhub_temp_admin')
    console.log('🧹 Cleared temporary admin data from localStorage')
  }, [])

  // DETAILED DEBUG LOGS
  useEffect(() => {
    if (user) {
      console.log('🔄 App.jsx - User data DETAILED:', {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses?.[0]?.emailAddress,
        publicMetadata: user.publicMetadata,
        hasRoleInMetadata: !!user.publicMetadata?.role,
        roleInMetadata: user.publicMetadata?.role
      })
      
      const isAdminByMetadata = user.publicMetadata?.role === 'admin'
      const isAdminById = user.id === 'user_35yANDeI7IqVMt1pIA2ILe12yh0'
      
      console.log('🔍 App.jsx - Admin Status Check DETAILED:', {
        isAdminByMetadata,
        isAdminById,
        finalIsAdmin: isAdminByMetadata || isAdminById,
        userMatchesTargetId: user.id === 'user_35yANDeI7IqVMt1pIA2ILe12yh0'
      })

      console.log('🔄 App.jsx - Full User Object:', user)
    }
  }, [user])

  // Sync user with backend
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && userId) {
        try {
          await syncUserWithBackend()
        } catch (error) {
          console.error('Failed to sync user with backend:', error)
          // Don't block the app if sync fails
        }
      }
      setAuthChecked(true)
    }

    syncUser()
  }, [isLoaded, isSignedIn, userId])

  // Show loading spinner only if auth is not loaded yet
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <SocketProvider>
        <JobProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:id" element={<Jobs />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-job" element={<CreateJob />} />
              <Route path="/admin/edit-job/:id" element={<EditJob />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </JobProvider>
      </SocketProvider>
    </ErrorBoundary>
  )
}

export default App
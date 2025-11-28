// src/App.jsx - UPDATED VERSION
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

// src/App.jsx - Add this useEffect for debugging
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Debug: Log API configuration
    console.log('🔧 Frontend Configuration:');
    console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('- VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
    console.log('- Mode:', import.meta.env.MODE);
    
    // Test API connection on startup
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then(res => res.json())
      .then(data => console.log('✅ Backend health check:', data))
      .catch(err => console.error('❌ Backend connection failed:', err));
  }, []);

  // ... rest of your App component
}

function App() {
  const { isSignedIn, userId, user, isLoaded } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)

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
// src/pages/AdminDashboard.jsx - TEMPORARY FIX
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useJob } from '../context/JobContext'
import { getJobs } from '../services/jobService'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Briefcase, 
  MessageCircle,
  Heart
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'

const AdminDashboard = () => {
  const { user } = useAuth()
  const { state, dispatch } = useJob()
  const { jobs, loading } = state

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalComments: 0,
    totalLikes: 0
  })

  // 🚨 TEMPORARY FIX - FORCE ADMIN ACCESS (REMOVE IN PRODUCTION)
  console.log('🚨 TEMPORARY ADMIN ACCESS ENABLED - REMOVE IN PRODUCTION')
  const isAdmin = true // Force admin access

  // DEBUG: Keep logs to see what's wrong
  console.log('🔍 AdminDashboard - User check DETAILED:', {
    userId: user?.id,
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
    userName: user?.fullName || user?.firstName,
    publicMetadata: user?.publicMetadata,
    hasRoleInMetadata: !!user?.publicMetadata?.role,
    roleInMetadata: user?.publicMetadata?.role,
    isAdminByMetadata: user?.publicMetadata?.role === 'admin',
    isAdminById: user?.id === 'user_35yANDeI7IqVMt1pIA2ILe12yh0'
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const response = await getJobs({ limit: 50 })
        
        const totalJobs = response.data.length
        const activeJobs = response.data.filter(job => new Date(job.deadline) > new Date()).length
        const totalApplications = response.data.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)
        const totalComments = response.data.reduce((sum, job) => sum + (job.commentsCount || 0), 0)
        const totalLikes = response.data.reduce((sum, job) => sum + (job.likesCount || 0), 0)

        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          totalComments,
          totalLikes
        })

        dispatch({ type: 'SET_JOBS', payload: response.data })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    fetchAdminData()
  }, [dispatch])

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">You need admin privileges to access this page.</p>
        <Link
          to="/"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-200"
        >
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage jobs and monitor platform activity</p>
        </div>
        <Link to="/admin/create-job">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <Card.Content className="text-center">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalJobs}</h3>
            <p className="text-gray-600">Total Jobs</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeJobs}</h3>
            <p className="text-gray-600">Active Jobs</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalComments}</h3>
            <p className="text-gray-600">Total Comments</p>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="text-center">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalLikes}</h3>
            <p className="text-gray-600">Total Likes</p>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading text="Loading jobs..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Applications</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Likes</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Comments</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Deadline</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 10).map(job => (
                    <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link 
                          to={`/jobs/${job._id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{job.company}</td>
                      <td className="py-3 px-4 text-gray-600">{job.applicationsCount || 0}</td>
                      <td className="py-3 px-4 text-gray-600">{job.likesCount || 0}</td>
                      <td className="py-3 px-4 text-gray-600">{job.commentsCount || 0}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(job.deadline).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link to={`/jobs/${job._id}`}>
                            <Button variant="outline" size="small">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/edit-job/${job._id}`}>
                            <Button variant="outline" size="small">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="danger" size="small">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No jobs posted yet.
                </div>
              )}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  )
}

export default AdminDashboard
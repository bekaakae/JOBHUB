// src/pages/Home.jsx - FIXED VERSION
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useJob } from '../context/JobContext'
import { getJobs, getCategories } from '../services/jobService'
import JobCard from '../components/jobs/JobCard'
import Loading from '../components/ui/Loading'
import Button from '../components/ui/Button'
import { ArrowRight, Search, Clock, Users } from 'lucide-react'

const Home = () => {
  const { state, dispatch } = useJob()
  const { jobs, categories } = state
  const [loading, setLoading] = useState(true)
  const [featuredJobs, setFeaturedJobs] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [jobsResponse, categoriesResponse] = await Promise.all([
          getJobs(),
          getCategories()
        ])

        dispatch({ type: 'SET_JOBS', payload: jobsResponse.data })
        dispatch({ type: 'SET_CATEGORIES', payload: categoriesResponse.data })

        // Ensure jobs is an array before slicing
        const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : []
        setFeaturedJobs(jobsData.slice(0, 6))
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty arrays on error
        dispatch({ type: 'SET_JOBS', payload: [] })
        setFeaturedJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="large" text="Loading jobs..." />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream 
            <span className="text-primary-200"> Job</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Discover thousands of job opportunities from top companies. 
            Start your career journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* FIXED: Use Link directly instead of as prop */}
            <Link to="/jobs" className="inline-flex">
              <Button
                size="large"
                className="border-white text-white hover:bg-primary-700"
              >
                <Search className="h-5 w-5 mr-2" />
                Browse All Jobs
              </Button>
            </Link>
            
            {/* FIXED: Use Link directly instead of as prop */}
            <Link to="/categories" className="inline-flex">
              <Button
                variant="outline"
                size="large"
                className="border-white text-white hover:bg-primary-700"
              >
                <Users className="h-5 w-5 mr-2" />
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <p className="text-gray-600 mt-2">Latest opportunities from top companies</p>
          </div>
          {/* FIXED: Use Link directly instead of as prop */}
          <Link to="/jobs" className="inline-flex">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Ensure featuredJobs is always an array */}
        {Array.isArray(featuredJobs) && featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Available</h3>
            <p className="text-gray-600 mb-4">Check back later for new job postings.</p>
            {/* FIXED: Use Link directly instead of as prop */}
            <Link to="/jobs" className="inline-flex">
              <Button>
                Browse All Jobs
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Categories Section */}
      {Array.isArray(categories) && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-600 mt-2">Find jobs in your field of expertise</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map(category => (
              <Link
                key={category._id}
                to={`/categories/${category._id}`}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 text-center group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition duration-200"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color
                  }}
                >
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition duration-200">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.jobCount || 0} jobs
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
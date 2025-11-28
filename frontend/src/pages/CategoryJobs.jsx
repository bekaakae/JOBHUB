// src/pages/CategoryJobs.jsx - NEW COMPONENT
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useJob } from '../context/JobContext'
import { getJobs, getCategories } from '../services/jobService'
import JobCard from '../components/jobs/JobCard'
import Loading from '../components/ui/Loading'
import { ArrowLeft, Briefcase } from 'lucide-react'

const CategoryJobs = () => {
  const { id } = useParams()
  const { state, dispatch } = useJob()
  const { jobs, categories } = state
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)
  const [categoryJobs, setCategoryJobs] = useState([])

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

        // Find the current category
        const currentCategory = categoriesResponse.data.find(cat => cat._id === id)
        setCategory(currentCategory)

        // Filter jobs by category
        if (currentCategory) {
          const filteredJobs = jobsResponse.data.filter(job => 
            job.category && job.category._id === id
          )
          setCategoryJobs(filteredJobs)
        }

      } catch (error) {
        console.error('Error fetching category jobs:', error)
        setCategoryJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, dispatch])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="large" text="Loading jobs..." />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Link
          to="/categories"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-200"
        >
          Back to Categories
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button and Category Header */}
      <div className="mb-8">
        <Link
          to="/categories"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
        
        <div className="flex items-center space-x-4 mb-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: `${category.color}20`,
              color: category.color
            }}
          >
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600 mt-1">
              {categoryJobs.length} job{categoryJobs.length !== 1 ? 's' : ''} available
            </p>
            {category.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {categoryJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryJobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Jobs in {category.name}
          </h3>
          <p className="text-gray-600 mb-4">
            There are no jobs available in this category at the moment.
          </p>
          <Link
            to="/jobs"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-200"
          >
            Browse All Jobs
          </Link>
        </div>
      )}
    </div>
  )
}

export default CategoryJobs
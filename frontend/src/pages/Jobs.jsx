// src/pages/Jobs.jsx - FIXED VERSION
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useJob } from '../context/JobContext'
import { getJobs } from '../services/jobService'
import { Filter, X, Search } from 'lucide-react'
import JobCard from '../components/jobs/JobCard'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'

const Jobs = () => {
  const { state, dispatch } = useJob()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filteredJobs, setFilteredJobs] = useState([])
  const [localLoading, setLocalLoading] = useState(true)

  // Safe destructuring with array fallback
  const { 
    jobs = [], 
    loading = false,
    filters = {
      search: '',
      category: '',
      location: '',
      jobType: '',
      experienceLevel: ''
    }
  } = state || {}

  // Ensure jobs is always an array before using it
  const safeJobs = Array.isArray(jobs) ? jobs : []

  // Apply filters whenever safeJobs or filters change
  useEffect(() => {
    const applyFilters = () => {
      console.log('🔍 Applying filters to jobs:', safeJobs)
      
      let filtered = [...safeJobs]

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(job => 
          job?.title?.toLowerCase().includes(searchLower) ||
          job?.company?.toLowerCase().includes(searchLower) ||
          job?.description?.toLowerCase().includes(searchLower)
        )
      }

      // Category filter
      if (filters.category) {
        filtered = filtered.filter(job => 
          job?.category && job.category._id === filters.category
        )
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase()
        filtered = filtered.filter(job => 
          job?.location?.toLowerCase().includes(locationLower)
        )
      }

      // Job type filter
      if (filters.jobType) {
        filtered = filtered.filter(job => job?.jobType === filters.jobType)
      }

      // Experience level filter
      if (filters.experienceLevel) {
        filtered = filtered.filter(job => job?.experienceLevel === filters.experienceLevel)
      }

      console.log('✅ Filtered jobs:', filtered)
      setFilteredJobs(filtered)
    }

    applyFilters()
  }, [safeJobs, filters])

  // Sync URL params with state
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const experienceLevel = searchParams.get('experienceLevel') || ''

    dispatch({
      type: 'SET_FILTERS',
      payload: { search, category, location, jobType, experienceLevel }
    })
  }, [searchParams, dispatch])

  // Fetch jobs when component mounts
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLocalLoading(true)
        console.log('🔄 Fetching jobs...')
        
        const response = await getJobs()
        console.log('📡 Jobs API response:', response)
        
        if (response && response.data) {
          // Ensure we're setting an array
          const jobsData = Array.isArray(response.data) ? response.data : []
          console.log('📦 Setting jobs data:', jobsData)
          dispatch({ type: 'SET_JOBS', payload: jobsData })
        } else {
          console.warn('⚠️ No data in jobs response')
          dispatch({ type: 'SET_JOBS', payload: [] })
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error)
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'SET_JOBS', payload: [] })
      } finally {
        setLocalLoading(false)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    fetchJobs()
  }, [dispatch])

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters }
    // Remove empty filters
    Object.keys(updatedFilters).forEach(key => {
      if (!updatedFilters[key]) {
        delete updatedFilters[key]
      }
    })
    setSearchParams(updatedFilters)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')
  const isLoading = loading || localLoading

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
          <p className="text-gray-600">
            {filteredJobs.length} jobs found
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Job title, company..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
                placeholder="City, state, or remote"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={filters.jobType}
                onChange={(e) => updateFilters({ jobType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => updateFilters({ experienceLevel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                <span>Clear All Filters</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="large" text="Loading jobs..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {safeJobs.length === 0 
                ? "There are no jobs available at the moment. Please check back later."
                : "Try adjusting your search filters or browse all categories."
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Jobs
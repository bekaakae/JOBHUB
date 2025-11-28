// src/pages/Categories.jsx - SIMPLIFIED VERSION
import { useEffect, useState } from 'react'
import { useJob } from '../context/JobContext'
import CategoryCard from '../components/categories/CategoryCard'
import Loading from '../components/ui/Loading'

const Categories = () => {
  const { state } = useJob()
  const [localLoading, setLocalLoading] = useState(false)
  
  // Safe destructuring with defaults
  const { categories = [], loading: contextLoading = false, error } = state || {}
  
  const isLoading = contextLoading || localLoading

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : []

  useEffect(() => {
    // If we have categories, we're not loading
    if (safeCategories.length > 0) {
      setLocalLoading(false)
    }
  }, [safeCategories])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="large" text="Loading categories..." />
      </div>
    )
  }

  if (error && safeCategories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Categories
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Job Categories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse jobs by category to find opportunities that match your skills and interests
        </p>
      </div>

      {/* Categories Grid */}
      {safeCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeCategories.map(category => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories available
            </h3>
            <p className="text-gray-600 mb-4">
              There are no job categories available at the moment.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
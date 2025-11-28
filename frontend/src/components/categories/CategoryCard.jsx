// src/components/categories/CategoryCard.jsx - UPDATED
import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'

const CategoryCard = ({ category }) => {
  // Safe destructuring with defaults
  const { 
    _id, 
    color = '#6B7280', 
    jobCount = 0, 
    name = 'Unnamed Category', 
    description 
  } = category || {}

  // If no _id, don't render the card
  if (!_id) {
    console.warn('⚠️ CategoryCard: Missing _id for category:', category)
    return null
  }

  return (
    <Link
      to={`/categories/${_id}`} // This should now work with the new route
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: `${color}20`,
            color: color
          }}
        >
          <Briefcase className="h-6 w-6" />
        </div>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {jobCount} job{jobCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition duration-200 mb-2">
        {name}
      </h3>
      
      {description && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {description}
        </p>
      )}
    </Link>
  )
}

export default CategoryCard
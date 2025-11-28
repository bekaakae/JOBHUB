// src/components/jobs/JobCard.jsx - IMPROVED
import { Link } from 'react-router-dom'
import { format, isAfter } from 'date-fns'
import { MapPin, Calendar, Building2, Clock, Mail, Globe, Copy } from 'lucide-react'

const JobCard = ({ job }) => {
  // Safe destructuring with defaults
  const {
    _id,
    title = 'Untitled Job',
    company = 'Unknown Company',
    location = 'Unknown Location',
    description = '',
    deadline,
    category,
    applicationLink,
    hrEmail
  } = job || {}

  const isDeadlineApproaching = isAfter(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    new Date(deadline)
  ) && isAfter(new Date(deadline), new Date())

  // Copy to clipboard function
  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text).then(() => {
      alert(message);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Don't render if no ID
  if (!_id) {
    console.warn('⚠️ JobCard: Missing _id for job:', job)
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link 
            to={`/jobs/${_id}`} 
            className="group-hover:text-primary-600 transition duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-600 mb-2">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="text-sm">{company}</span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
        
        {category && (
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2"
            style={{ 
              backgroundColor: `${category.color}20`,
              color: category.color
            }}
          >
            {category.name}
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      {/* Contact Methods */}
      <div className="flex items-center space-x-4 mb-4">
        {applicationLink && (
          <div 
            className="flex items-center text-xs text-blue-600 cursor-pointer hover:underline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(applicationLink, 'Application link copied!');
            }}
            title="Click to copy application link"
          >
            <Globe className="h-3 w-3 mr-1" />
            <span>Online Apply</span>
          </div>
        )}
        {hrEmail && (
          <div 
            className="flex items-center text-xs text-green-600 cursor-pointer hover:underline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              copyToClipboard(hrEmail, 'HR email copied to clipboard!');
            }}
            title="Click to copy HR email"
          >
            <Mail className="h-3 w-3 mr-1" />
            <span>Email HR</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Apply by {format(new Date(deadline), 'MMM dd, yyyy')}</span>
        </div>
        
        {isDeadlineApproaching && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Ending soon
          </span>
        )}
      </div>
    </div>
  )
}

export default JobCard
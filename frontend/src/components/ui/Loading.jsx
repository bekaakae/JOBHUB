// src/components/ui/Loading.jsx
const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizes[size]}`}></div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  )
}

export default Loading
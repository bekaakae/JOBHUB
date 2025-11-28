// src/components/layout/Header.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  SignedIn, 
  SignedOut, 
  UserButton, 
  SignInButton,
  useUser 
} from '@clerk/clerk-react'
import { Menu, Search, Plus } from 'lucide-react'

const Header = ({ setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Use public metadata for role or fallback to checking specific user IDs
  const isAdmin = user?.publicMetadata?.role === 'admin' || 
                 ['user_2h9J7x8X8Q8X8X8X8X8X8X8', 'user_2h9J7x8X8Q8X8X8X8X8X9','user_35yANDeI7IqVMt1pIA2ILe12yh0'].includes(user?.id)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">JobHub</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Navigation and auth */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              {isAdmin && (
                <Link
                  to="/admin/create-job"
                  className="hidden md:flex items-center space-x-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Job</span>
                </Link>
              )}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition duration-200">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
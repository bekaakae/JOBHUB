// src/components/layout/Sidebar.jsx
import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  SignedIn, 
  SignedOut,
  useUser 
} from '@clerk/clerk-react'
import { 
  X, 
  Home, 
  Briefcase, 
  Folder, 
  Settings,
  User 
} from 'lucide-react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const { user } = useUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Categories', href: '/categories', icon: Folder },
  ]

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: Settings },
    { name: 'Post Job', href: '/admin/create-job', icon: Briefcase },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setSidebarOpen(false)} 
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JH</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">JobHub</span>
                  </Link>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition duration-200 ${
                        isActive(item.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
                      {item.name}
                    </Link>
                  ))}
                  
                  <SignedIn>
                    {isAdmin && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Admin
                        </div>
                        {adminNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition duration-200 ${
                              isActive(item.href)
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="mr-4 flex-shrink-0 h-6 w-6" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </SignedIn>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JH</span>
                </div>
                <span className="text-xl font-bold text-gray-900">JobHub</span>
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
              
              <SignedIn>
                {isAdmin && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Admin
                    </div>
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition duration-200 ${
                          isActive(item.href)
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </SignedIn>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, User, LogOut, Settings } from 'lucide-react'
import USAFlag from '@/assets/languages/united-states-of-america-flag.svg'
import SpainFlag from '@/assets/languages/spain-flag.svg'

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('es')

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Alquila</h1>
          </Link>
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/properties" className="text-gray-600 hover:text-gray-900">
                Properties
              </Link>
              <Link to="/renters" className="text-gray-600 hover:text-gray-900">
                Renters
              </Link>
              <Link to="/payments" className="text-gray-600 hover:text-gray-900">
                Payments
              </Link>
              <Link to="/maintenance" className="text-gray-600 hover:text-gray-900">
                Maintenance
              </Link>
              <Link to="/documents" className="text-gray-600 hover:text-gray-900">
                Documents
              </Link>
            </nav>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center focus:outline-none px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700"
              >
                <img 
                  src={currentLanguage === 'es' ? SpainFlag : USAFlag} 
                  alt={currentLanguage === 'es' ? 'Spanish' : 'English'}
                  className="h-5 w-7"
                  width={28}
                  height={20}
                />
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => {
                      setCurrentLanguage('es')
                      setIsLanguageMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                      currentLanguage === 'es' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <img src={SpainFlag} alt="Spain Flag" className="h-5 w-7" />
                    <span>Español</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLanguage('en')
                      setIsLanguageMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                      currentLanguage === 'en' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <img src={USAFlag} alt="USA Flag" className="h-5 w-7" />
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {/*TODO: Add logout logic here */}}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
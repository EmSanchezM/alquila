import { Link } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Alquila</h1>
          </Link>
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
        </div>
      </div>
    </header>
  )
}

export default Header
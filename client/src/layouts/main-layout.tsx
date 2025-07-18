import { FC } from 'react'
import { Outlet } from '@tanstack/react-router'

import Header from '@/components/shared/header'

interface Props {
  user?: {
    email: string
  }
}

const MainLayout: FC<Props> = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <>
          <Header />
        </>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
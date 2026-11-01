import { FC } from 'react'
import { Outlet } from '@tanstack/react-router'

import Header from '@/components/shared/header'
import type { SessionUser } from '@/lib/auth-client'

interface Props {
  user: SessionUser
}

const MainLayout: FC<Props> = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout

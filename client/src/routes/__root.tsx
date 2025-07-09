import { createRootRoute, Outlet } from '@tanstack/react-router'

import Header from '@/components/shared/header'

export const Route = createRootRoute({
  component: () => {
    const { user } = { user: { email: "test@test.com" } }

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
  },
})
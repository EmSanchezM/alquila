import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <section className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Outlet />
    </section>
  )
}

{/**
  <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <Outlet />
      </div>
    </div>
  
  */}
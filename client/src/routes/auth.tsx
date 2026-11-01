import { createFileRoute, redirect } from '@tanstack/react-router'
import AuthLayout from '@/layouts/auth-layout'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (data) throw redirect({ to: '/dashboard' })
  },
  component: () => <AuthLayout />,
})

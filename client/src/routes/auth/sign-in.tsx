import { createFileRoute } from '@tanstack/react-router'
import SignIn from '@/features/authentication/sign-in'

export const Route = createFileRoute('/auth/sign-in')({
  component: SignIn,
})

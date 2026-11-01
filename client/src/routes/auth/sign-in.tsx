import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import SignIn from '@/features/authentication/sign-in'

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: SignIn,
})

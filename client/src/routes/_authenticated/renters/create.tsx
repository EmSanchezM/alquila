import { createFileRoute } from '@tanstack/react-router'

import CreateRenter from '@/features/renters/create'

export const Route = createFileRoute('/_authenticated/renters/create')({
  component: CreateRenter,
})

import { createFileRoute } from '@tanstack/react-router'

import CreateTemplate from '@/features/communications/templates/create'

export const Route = createFileRoute('/_authenticated/renters/communications/templates/create')({
  component: CreateTemplate,
})

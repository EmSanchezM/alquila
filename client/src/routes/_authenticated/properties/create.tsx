import { createFileRoute } from '@tanstack/react-router'

import CreateProperty from '@/features/properties/create'

export const Route = createFileRoute('/_authenticated/properties/create')({
  component: CreateProperty,
})
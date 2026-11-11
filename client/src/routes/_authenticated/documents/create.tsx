import { createFileRoute } from '@tanstack/react-router'

import CreateDocument from '@/features/documents/create'

export const Route = createFileRoute('/_authenticated/documents/create')({
  component: CreateDocument,
})

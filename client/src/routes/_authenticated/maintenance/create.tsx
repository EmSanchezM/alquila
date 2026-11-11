import { createFileRoute } from '@tanstack/react-router'

import CreateMaintenanceRequest from '@/features/maintenance/create'

export const Route = createFileRoute('/_authenticated/maintenance/create')({
  component: CreateMaintenanceRequest,
})

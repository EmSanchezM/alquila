import { createFileRoute } from '@tanstack/react-router'

import PropertiesPage from '@/features/properties'

export const Route = createFileRoute('/_authenticated/properties/')({
  component: PropertiesPage,
})
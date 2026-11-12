import { createFileRoute } from '@tanstack/react-router'

import EditTemplate from '@/features/communications/templates/edit'

export const Route = createFileRoute('/_authenticated/renters/communications/templates/$templateId/edit')({
  component: EditTemplatePage,
})

function EditTemplatePage() {
  const { templateId } = Route.useParams()
  return <EditTemplate templateId={templateId} />
}

import { createFileRoute } from '@tanstack/react-router'

import EditDocument from '@/features/documents/edit'

export const Route = createFileRoute('/_authenticated/documents/$documentId/edit')({
  component: EditDocumentPage,
})

function EditDocumentPage() {
  const { documentId } = Route.useParams()
  return <EditDocument documentId={documentId} />
}

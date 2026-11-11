import { createFileRoute } from '@tanstack/react-router'

import DocumentDetails from '@/features/documents/details'

export const Route = createFileRoute('/_authenticated/documents/$documentId/')({
  component: DocumentDetailsPage,
})

function DocumentDetailsPage() {
  const { documentId } = Route.useParams()
  return <DocumentDetails documentId={documentId} />
}

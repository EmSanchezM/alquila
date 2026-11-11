import { FC, ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Pencil, Star } from 'lucide-react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DeleteResourceButton from '@/components/shared/delete-resource-button'
import { LoadErrorState, LoadingState, NotFoundState } from '@/components/shared/resource-states'
import ExpirationBadge from '@/features/documents/components/expiration-badge'
import { ApiError } from '@/lib/services/api-client'
import { deleteDocument, DOCUMENT_TYPES, documentsQueryKey, getDocumentQueryOptions, tagsOf } from '@/lib/services/documents'
import { formatFileSize, isImage } from '@/lib/services/files'
import { labelOf } from '@/lib/utils/options'

interface DocumentDetailsProps {
  documentId: string
}

const Detail = ({ label, children }: { label: string, children: ReactNode }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
  </div>
)

const DocumentDetails: FC<DocumentDetailsProps> = ({ documentId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: document, isLoading, error, refetch } = useQuery(getDocumentQueryOptions(documentId))

  if (isLoading) {
    return <LoadingState>Loading document...</LoadingState>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Document not found"
        action={<Button asChild><Link to="/documents">Back to documents</Link></Button>}
      />
    )
  }

  if (!document) {
    return <LoadErrorState message="Failed to load the document." onRetry={() => refetch()} />
  }

  const tags = tagsOf(document)

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/documents" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Documents
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{document.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {document.isImportant && <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" aria-label="Important" />}
            <h2 className="text-2xl font-bold leading-7 text-gray-900">{document.name}</h2>
            <Badge variant="outline">{labelOf(DOCUMENT_TYPES, document.type)}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={document.fileUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open file
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/documents/$documentId/edit" params={{ documentId }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteResourceButton
              title={`Delete "${document.name}"?`}
              description="The document will be removed from your records. This cannot be undone from the app."
              confirmLabel="Delete document"
              onDelete={() => deleteDocument(documentId)}
              onDeleted={async () => {
                queryClient.removeQueries({ queryKey: [...documentsQueryKey, documentId] })
                await queryClient.invalidateQueries({ queryKey: documentsQueryKey, exact: true })
                await navigate({ to: '/documents' })
              }}
            />
          </div>
        </div>
      </header>

      {error && <LoadErrorState message="Could not refresh the document. Showing the last loaded version." onRetry={() => refetch()} />}

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr] max-w-6xl">
        <div className="rounded-lg border bg-white overflow-hidden min-h-64">
          {isImage(document.mimeType) ? (
            <img src={document.fileUrl} alt={document.name} className="w-full h-auto object-contain max-h-[70vh]" />
          ) : document.mimeType === 'application/pdf' ? (
            <iframe src={document.fileUrl} title={document.name} className="w-full h-[70vh]" />
          ) : (
            <p className="p-6 text-sm text-gray-500">No preview available. Use "Open file".</p>
          )}
        </div>

        <dl className="grid gap-4 content-start">
          <Detail label="Property">
            {document.propertyId && document.propertyName && (
              <Link to="/properties/$propertyId" params={{ propertyId: document.propertyId }} className="text-blue-600 hover:underline">
                {document.propertyName}
              </Link>
            )}
          </Detail>
          <Detail label="Renter">
            {document.renterId && document.renterName && (
              <Link to="/renters/$renterId" params={{ renterId: document.renterId }} className="text-blue-600 hover:underline">
                {document.renterName}
              </Link>
            )}
          </Detail>
          <Detail label="Lease">
            {document.leaseId && document.leaseName && (
              <Link to="/leases/$leaseId" params={{ leaseId: document.leaseId }} className="text-blue-600 hover:underline">
                {document.leaseName}
              </Link>
            )}
          </Detail>
          <Detail label="Expires"><ExpirationBadge expirationDate={document.expirationDate} /></Detail>
          <Detail label="Size">{formatFileSize(document.fileSize)}</Detail>
          <Detail label="Tags">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}
          </Detail>
        </dl>
      </section>
    </>
  )
}

export default DocumentDetails

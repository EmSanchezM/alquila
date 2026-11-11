import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import DocumentForm from "@/features/documents/components/document-form"
import { ApiError } from "@/lib/services/api-client"
import { documentsQueryKey, getDocumentQueryOptions, updateDocument } from "@/lib/services/documents"
import { toDocumentForm, toDocumentInput, type DocumentFormValues } from "@/lib/validations/documents"

interface EditDocumentProps {
  documentId: string
}

const EditDocument: FC<EditDocumentProps> = ({ documentId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: document, isLoading, error, refetch } = useQuery(getDocumentQueryOptions(documentId))

  const mutation = useMutation({
    mutationFn: (values: DocumentFormValues) => {
      // Only send fileUrl when a new file was uploaded, so a file that predates the
      // file storage (an external URL) is kept instead of failing validation.
      const { fileUrl, ...rest } = toDocumentInput(values)
      return updateDocument(documentId, fileUrl === document?.fileUrl ? rest : { ...rest, fileUrl })
    },
    onSuccess: async () => {
      // The update answers without names; refetch the list and the detail.
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey })
      await navigate({ to: "/documents/$documentId", params: { documentId } })
    },
  })

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
                <BreadcrumbLink asChild>
                  <Link to="/documents/$documentId" params={{ documentId }} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    {document.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Document</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <DocumentForm
          defaultValues={toDocumentForm(document)}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/documents/$documentId", params: { documentId } }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditDocument

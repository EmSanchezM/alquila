import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import DocumentForm from "@/features/documents/components/document-form"
import { createDocument, documentsQueryKey } from "@/lib/services/documents"
import { emptyDocumentForm, toDocumentInput, type DocumentFormValues } from "@/lib/validations/documents"

const CreateDocument = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: DocumentFormValues) => createDocument(toDocumentInput(values)),
    onSuccess: async (document) => {
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey, exact: true })
      await navigate({ to: "/documents/$documentId", params: { documentId: document.id } })
    },
  })

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
                <BreadcrumbPage className="text-sm font-medium text-gray-900">Upload document</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Upload Document</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Store a contract, receipt or certificate and link it to a property, renter or lease.
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <DocumentForm
          defaultValues={emptyDocumentForm}
          submitLabel="Save document"
          pendingLabel="Saving..."
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          cancel={{ to: "/documents" }}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default CreateDocument

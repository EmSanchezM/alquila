import { FC } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { LoadErrorState, LoadingState, NotFoundState } from "@/components/shared/resource-states"
import TemplateForm from "@/features/communications/templates/template-form"
import { ApiError } from "@/lib/services/api-client"
import { getTemplateQueryOptions, templatesQueryKey, updateTemplate } from "@/lib/services/communication-templates"
import { toTemplateForm, toTemplateInput, type TemplateFormValues } from "@/lib/validations/communication-templates"

const EditTemplate: FC<{ templateId: string }> = ({ templateId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: template, isLoading, error, refetch } = useQuery(getTemplateQueryOptions(templateId))

  const mutation = useMutation({
    mutationFn: (values: TemplateFormValues) => updateTemplate(templateId, toTemplateInput(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesQueryKey })
      await navigate({ to: "/renters/communications", search: { tab: "templates" } })
    },
  })

  if (isLoading) return <LoadingState>Loading template...</LoadingState>

  if (error instanceof ApiError && error.status === 404) {
    return (
      <NotFoundState
        title="Template not found"
        action={<Button asChild><Link to="/renters/communications" search={{ tab: "templates" }}>Back to templates</Link></Button>}
      />
    )
  }

  if (!template) return <LoadErrorState message="Failed to load the template." onRetry={() => refetch()} />

  return (
    <>
      <header className="mb-8">
        <nav className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/renters/communications" search={{ tab: "templates" }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Templates</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">{template.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">Edit Template</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <TemplateForm
          defaultValues={toTemplateForm(template)}
          submitLabel="Save changes"
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

export default EditTemplate

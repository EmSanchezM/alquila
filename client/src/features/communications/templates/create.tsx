import { Link, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import TemplateForm from "@/features/communications/templates/template-form"
import { createTemplate, templatesQueryKey } from "@/lib/services/communication-templates"
import { emptyTemplateForm, toTemplateInput, type TemplateFormValues } from "@/lib/validations/communication-templates"

export default function CreateTemplate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: TemplateFormValues) => createTemplate(toTemplateInput(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesQueryKey })
      await navigate({ to: "/renters/communications", search: { tab: "templates" } })
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
                  <Link to="/renters/communications" search={{ tab: "templates" }} className="text-sm font-medium text-gray-500 hover:text-gray-700">Templates</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-900">New template</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900">New Template</h2>
        </div>
      </header>
      <section className="mt-8 max-w-4xl">
        <TemplateForm
          defaultValues={emptyTemplateForm}
          submitLabel="Create template"
          isPending={mutation.isPending}
          error={mutation.error?.message ?? null}
          onSubmit={(values) => mutation.mutate(values)}
        />
      </section>
    </>
  )
}

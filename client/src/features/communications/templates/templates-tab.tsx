import { Link } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FileText, Pencil, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DeleteResourceButton from "@/components/shared/delete-resource-button"
import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import { deleteTemplate, getAllTemplatesQueryOptions, TEMPLATE_CATEGORIES, TEMPLATE_TYPES, templatesQueryKey } from "@/lib/services/communication-templates"
import { labelOf } from "@/lib/utils/options"

export default function TemplatesTab() {
  const queryClient = useQueryClient()
  const { data: templates = [], isLoading, error, refetch } = useQuery(getAllTemplatesQueryOptions)

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center gap-4">
        <p className="text-sm text-gray-500">Reusable messages; their {"{{variables}}"} are filled with the renter's data when you log a communication.</p>
        <Button asChild>
          <Link to="/renters/communications/templates/create">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      {error && !templates.length && <LoadErrorState message="Failed to load templates." onRetry={() => refetch()} />}
      {isLoading && <LoadingState>Loading templates...</LoadingState>}

      {!isLoading && templates.length === 0 && !(error && !templates.length) && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500">Create one for messages you send often, like rent reminders.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} data-testid="template-card">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1 flex gap-2">
                    <Badge variant="outline">{labelOf(TEMPLATE_TYPES, template.type)}</Badge>
                    <Badge variant="secondary">{labelOf(TEMPLATE_CATEGORIES, template.category)}</Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/renters/communications/templates/$templateId/edit" params={{ templateId: template.id }} aria-label={`Edit ${template.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteResourceButton
                    title={`Delete "${template.name}"?`}
                    description="The template will be removed. Communications already logged with it are kept."
                    confirmLabel="Delete template"
                    onDelete={() => deleteTemplate(template.id)}
                    onDeleted={() => queryClient.invalidateQueries({ queryKey: templatesQueryKey })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {template.subject && <p className="text-sm font-medium">{template.subject}</p>}
              <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">{template.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { queryOptions } from "@tanstack/react-query";

import { crudClient, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `communication_templates` table as the API returns it. */
export interface CommunicationTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  subject: string | null;
  content: string;
  /** Derived by the server from the {{placeholders}} in subject and content. */
  variables: string[] | null;
}

export const TEMPLATE_TYPES = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: "payment_reminder", label: "Payment reminder" },
  { value: "welcome", label: "Welcome" },
  { value: "maintenance", label: "Maintenance" },
  { value: "general", label: "General" },
] as const;

export const TEMPLATE_VARIABLES = [
  { value: "tenant_name", label: "Renter's full name" },
  { value: "property_name", label: "Property of the renter's active lease" },
  { value: "amount", label: "Monthly rent of that lease" },
  { value: "due_date", label: "Next payment due date of that lease" },
] as const;

/** Body accepted by POST and PUT /api/communication-templates. */
export interface TemplateInput {
  name: string;
  type: string;
  category: string;
  subject: string | null;
  content: string;
}

const templates = crudClient<CommunicationTemplate, TemplateInput>("/communication-templates");

export const createTemplate = templates.create;
export const updateTemplate = templates.update;
export const deleteTemplate = templates.remove;

export const templatesQueryKey = ["communication-templates"] as const;

export const getAllTemplatesQueryOptions = queryOptions({
  queryKey: templatesQueryKey,
  queryFn: templates.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getTemplateQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...templatesQueryKey, id],
    queryFn: () => templates.get(id),
    retry: retryServerErrors,
  });

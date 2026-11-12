import { z } from "zod";

import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES, type CommunicationTemplate, type TemplateInput } from "@/lib/services/communication-templates";

const oneOf = (options: readonly { value: string }[], message: string) =>
  z.string().refine((v) => options.some((o) => o.value === v), message);

// Limits mirror the server schema; unknown {{variables}} are reported by the server.
export const TemplateFormValidation = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100, "Use 100 characters or fewer"),
  type: oneOf(TEMPLATE_TYPES, "Select a type"),
  category: oneOf(TEMPLATE_CATEGORIES, "Select a category"),
  subject: z.string().trim().max(200, "Use 200 characters or fewer"),
  content: z.string().trim().min(1, "Write the template"),
});

export type TemplateFormValues = z.infer<typeof TemplateFormValidation>;

export const emptyTemplateForm: TemplateFormValues = { name: "", type: "", category: "", subject: "", content: "" };

export const toTemplateForm = (template: CommunicationTemplate): TemplateFormValues => ({
  name: template.name,
  type: template.type,
  category: template.category,
  subject: template.subject ?? "",
  content: template.content,
});

export const toTemplateInput = (values: TemplateFormValues): TemplateInput => ({
  name: values.name.trim(),
  type: values.type,
  category: values.category,
  subject: values.subject.trim() === "" ? null : values.subject.trim(),
  content: values.content.trim(),
});

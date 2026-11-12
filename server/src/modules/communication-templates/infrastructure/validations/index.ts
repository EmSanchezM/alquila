import { z } from "zod";

// Limits mirror the `communication_templates` table, so invalid values answer 400 instead of failing in Postgres.
export const templateTypes = ["email", "sms"] as const;
export const templateCategories = ["payment_reminder", "welcome", "maintenance", "general"] as const;

// variables is not accepted: the server derives it from the {{placeholders}} in subject and content.
const fields = {
  name: z.string().min(1).max(100),
  type: z.enum(templateTypes),
  category: z.enum(templateCategories),
  subject: z.string().max(200).nullable().optional(),
  content: z.string().min(1),
};

export const createTemplateSchema = z.object(fields);

export const updateTemplateSchema = z.object({
  param: z.object({ id: z.string() }),
  body: z.object(fields).partial(),
});

export const findByIdTemplateSchema = z.object({
  id: z.string(),
});

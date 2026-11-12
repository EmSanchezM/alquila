import { AppError } from "@server/shared/errors";

/** The placeholders a template may use; the client fills them from a renter and their lease. */
export const TEMPLATE_VARIABLES = ["tenant_name", "property_name", "amount", "due_date"] as const;

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** The variables used in the texts, in order of first appearance; unknown ones answer 400. */
export function templateVariables(...texts: (string | null | undefined)[]): string[] {
  const found: string[] = [];
  for (const text of texts) {
    for (const match of (text ?? "").matchAll(PLACEHOLDER)) {
      const name = match[1] ?? "";
      if (!(TEMPLATE_VARIABLES as readonly string[]).includes(name)) {
        throw new AppError(`Unknown variable {{${name}}}. Use tenant_name, property_name, amount or due_date`, 400);
      }
      if (!found.includes(name)) found.push(name);
    }
  }
  return found;
}

import { createPropertySchema } from "shared";

// Client-side form validation schema based on server schema
// Omits server-only fields like userId and isActive
export const CreatePropertyFormValidation = createPropertySchema.omit({
  userId: true,
});

// Re-export server validation types for consistency
export type { CreateProperty, UpdateProperty } from "shared";
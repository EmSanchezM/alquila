/**
 * Main server entry point for type exports and app instance
 * This file provides centralized exports for client consumption
 */

// Export the main app instance for potential server-side usage
export { default as app } from "./app";

// Export API route types for client type safety
export type { ApiRoutes } from "./app";

// Export database types for client type safety
export type {
  Property,
  Renter,
  Lease,
  Expense,
  MaintenanceRequest,
  Document,
  Payment
} from "./database/schema";

// Export validation schemas and types for client form validation
export {
  createPropertySchema,
  updatePropertySchema,
  findAllPropertiesSchema,
  findByIdPropertiesSchema
} from "./modules/properties/infrastructure/validations";

export type {
  CreateProperty,
  UpdateProperty,
  FindAllProperties,
  FindByIdProperties,
  DeleteProperty
} from "./modules/properties/infrastructure/validations";
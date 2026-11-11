import { z } from "zod";

// Limits mirror the `maintenance_requests` table, so invalid values answer 400 instead of failing in Postgres.
// The category list in the table is open ("plumbing, electrical, hvac, general, etc."); appliances is in use.
export const maintenanceCategories = ["plumbing", "electrical", "hvac", "appliances", "general"] as const;
export const maintenancePriorities = ["low", "medium", "high", "urgent"] as const;
export const maintenanceStatuses = ["open", "in_progress", "completed", "closed"] as const;

// Timestamps accept an ISO date-time with offset or an ISO date (read as UTC midnight).
const timestamp = z.union([z.iso.datetime({ offset: true }), z.iso.date()]).transform((value) => new Date(value));
// estimated_cost and actual_cost are decimal(10, 2).
const cost = z.number().min(0).multipleOf(0.01).max(99_999_999.99).transform(String);

// Columns that are nullable or have a table default: optional, and null clears the nullable ones.
const optionalFields = {
  renterId: z.string().nullable().optional(),
  priority: z.enum(maintenancePriorities).optional(),
  status: z.enum(maintenanceStatuses).optional(),
  reportedDate: timestamp.optional(),
  scheduledDate: timestamp.nullable().optional(),
  completedDate: timestamp.nullable().optional(),
  assignedTo: z.string().max(100).nullable().optional(),
  estimatedCost: cost.nullable().optional(),
  actualCost: cost.nullable().optional(),
  // Up to 10 photo URLs; the use cases check they are the caller's uploaded images.
  photos: z.array(z.string().max(500)).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
};

export const createMaintenanceRequestSchema = z.object({
  propertyId: z.string(),
  title: z.string({ error: (issue) => (issue.input === undefined ? "title is required" : undefined) }).max(200),
  description: z.string(),
  category: z.enum(maintenanceCategories, { error: (issue) => (issue.input === undefined ? "category is required" : undefined) }),
  ...optionalFields,
});

export const findAllMaintenanceRequestsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdMaintenanceRequestsSchema = z.object({
  id: z.string(),
});

export const updateMaintenanceRequestsSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    propertyId: z.string().optional(),
    title: z.string().max(200).optional(),
    description: z.string().optional(),
    category: z.enum(maintenanceCategories).optional(),
    ...optionalFields,
  }),
});


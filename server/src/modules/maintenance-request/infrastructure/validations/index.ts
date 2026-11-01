import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  propertyId: z.string(),
  renterId: z.string(),
  userId: z.string(),
  title: z.string({ error: (issue) => (issue.input === undefined ? "title is required" : undefined) }),
  description: z.string(),
  category: z.string({ error: (issue) => (issue.input === undefined ? "category is required" : undefined) }),
  priority: z.string({ error: (issue) => (issue.input === undefined ? "priority is required" : undefined) }),
  status: z.string({ error: (issue) => (issue.input === undefined ? "status is required" : undefined) }),
  reportedDate: z.coerce.date(),
  scheduledDate: z.coerce.date(),
  completedDate: z.coerce.date(),
  assignedTo: z.string(),
  estimatedCost: z.number().transform(String),
  actualCost: z.number().transform(String),
  photos: z.array(z.string()).optional(),
  notes: z.string(),
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
    renterId: z.string().optional(),
    userId: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.string().optional(),
    status: z.string().optional(),
    reportedDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
    completedDate: z.coerce.date().optional(),
    assignedTo: z.string().optional(),
    estimatedCost: z.number().transform(String).optional(),
    actualCost: z.number().transform(String).optional(),
    photos: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});


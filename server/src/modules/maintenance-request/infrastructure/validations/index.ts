import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  propertyId: z.string(),
  renterId: z.string(),
  userId: z.string(),
  title: z.string({ required_error: "title is required" }),
  description: z.string(),
  category: z.string({ required_error: "category is required" }),
  priority: z.string({ required_error: "priority is required" }),
  status: z.string({ required_error: "status is required" }),
  reportedDate: z.string(),
  scheduledDate: z.string(),
  completedDate: z.string(),
  assignedTo: z.string(),
  estimatedCost: z.number(),
  actualCost: z.number(),
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
    reportedDate: z.string().optional(),
    scheduledDate: z.string().optional(),
    completedDate: z.string().optional(),
    assignedTo: z.string().optional(),
    estimatedCost: z.number().optional(),
    actualCost: z.number().optional(),
    photos: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});


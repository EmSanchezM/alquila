import { z } from "zod";

// Limits mirror the `renters` table, so invalid values answer 400 instead of failing in Postgres.
export const verificationStatuses = ["pending", "verified", "rejected"] as const;

// Columns that are nullable in the table: optional, and null clears them.
const nullableFields = {
  email: z.email().max(255).nullable().optional(),
  phoneNumber: z.string().max(20).nullable().optional(),
  dniNumber: z.string().max(50).nullable().optional(),
  verificationStatus: z.enum(verificationStatuses).optional(),
  notes: z.string().nullable().optional(),
};

export const createRenterSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  ...nullableFields,
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).nullable().optional(),
});

export const findAllRenterSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdRentersSchema = z.object({
  id: z.string(),
});

export const updateRenterSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    ...nullableFields,
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).nullable().optional(),
  }),
});

export type CreateRenter = z.infer<typeof createRenterSchema>;
export type UpdateRenter = z.infer<typeof updateRenterSchema>;
export type FindAllRenter = z.infer<typeof findAllRenterSchema>;
export type FindByIdRenter = z.infer<typeof findByIdRentersSchema>;
export type DeleteRenter = z.infer<typeof findByIdRentersSchema>;


import { z } from "zod";

export const createRenterSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  dniNumber: z.string(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }),
  verificationStatus: z.string(),
  notes: z.string(),
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
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    dniNumber: z.string().optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).optional(),
    verificationStatus: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export type CreateRenter = z.infer<typeof createRenterSchema>;
export type UpdateRenter = z.infer<typeof updateRenterSchema>;
export type FindAllRenter = z.infer<typeof findAllRenterSchema>;
export type FindByIdRenter = z.infer<typeof findByIdRentersSchema>;
export type DeleteRenter = z.infer<typeof findByIdRentersSchema>;


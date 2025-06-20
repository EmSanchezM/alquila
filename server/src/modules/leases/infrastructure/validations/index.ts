import { z } from "zod";

export const creatLeaseSchema = z.object({
  propertyId: z.string(),
  renterId: z.string(),
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  monthlyRent: z.number(),
  securityDeposit: z.number(),
  paymentDueDay: z.number(),
  status: z.string(),
  contractFile: z.string(),
  terms: z.string(),
  autoRenew: z.boolean(),
});

export const findAllLeaseSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdLeasesSchema = z.object({
  id: z.string(),
});

export const updateLeaseSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    monthlyRent: z.number().optional(),
    securityDeposit: z.number().optional(),
    paymentDueDay: z.number().optional(),
    status: z.string().optional(),
    contractFile: z.string().optional(),
    terms: z.string().optional(),
    autoRenew: z.boolean().optional(),
  }),
});

export type CreateLease = z.infer<typeof creatLeaseSchema>;
export type UpdateLease = z.infer<typeof updateLeaseSchema>;
export type FindAllLease = z.infer<typeof findAllLeaseSchema>;
export type FindByIdLease = z.infer<typeof findByIdLeasesSchema>;
export type DeleteLease = z.infer<typeof findByIdLeasesSchema>;



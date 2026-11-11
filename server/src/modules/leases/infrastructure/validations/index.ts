import { z } from "zod";

// Limits mirror the `leases` table, so invalid values answer 400 instead of failing in Postgres.
export const leaseStatuses = ["pending", "active", "expired", "terminated"] as const;

// monthly_rent and security_deposit are decimal(10, 2).
const money = z.number().min(0).max(99_999_999.99).transform(String);

const endNotBeforeStart = (lease: { startDate?: string, endDate?: string }) =>
  !lease.startDate || !lease.endDate || lease.endDate >= lease.startDate;
const endNotBeforeStartIssue = { message: "endDate must be on or after startDate", path: ["endDate"] };

// Columns that are nullable or have a table default: optional, and null clears the nullable ones.
const optionalFields = {
  securityDeposit: money.nullable().optional(),
  paymentDueDay: z.number().int().min(1).max(31).optional(),
  status: z.enum(leaseStatuses).optional(),
  contractFile: z.string().max(500).nullable().optional(),
  terms: z.string().nullable().optional(),
  autoRenew: z.boolean().optional(),
};

export const creatLeaseSchema = z.object({
  propertyId: z.string(),
  renterId: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  monthlyRent: money,
  ...optionalFields,
}).refine(endNotBeforeStart, endNotBeforeStartIssue);

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
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
    monthlyRent: money.optional(),
    ...optionalFields,
  }).refine(endNotBeforeStart, endNotBeforeStartIssue),
});

export type CreateLease = z.infer<typeof creatLeaseSchema>;
export type UpdateLease = z.infer<typeof updateLeaseSchema>;
export type FindAllLease = z.infer<typeof findAllLeaseSchema>;
export type FindByIdLease = z.infer<typeof findByIdLeasesSchema>;
export type DeleteLease = z.infer<typeof findByIdLeasesSchema>;



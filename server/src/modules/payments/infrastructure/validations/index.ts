import { z } from "zod";

// Limits mirror the `payments` table, so invalid values answer 400 instead of failing in Postgres.
export const paymentStatuses = ["pending", "paid", "overdue", "partial"] as const;
export const paymentMethods = ["cash", "transfer", "check", "card"] as const;

// amount is decimal(10, 2); a payment of 0 has no meaning.
const amount = z.number().positive().multipleOf(0.01).max(99_999_999.99).transform(String);

// Columns that are nullable or have a table default: optional, and null clears the nullable ones.
const optionalFields = {
  paidDate: z.iso.date().nullable().optional(),
  paymentMethod: z.enum(paymentMethods).nullable().optional(),
  status: z.enum(paymentStatuses).optional(),
  reference: z.string().max(100).nullable().optional(),
  // An empty receipt used to be sent for "none"; it is stored as null. The use cases check it is the caller's upload.
  receiptFile: z.preprocess((value) => (value === "" ? null : value), z.string().max(500).nullable().optional()),
  notes: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
};

export const createPaymentSchema = z.object({
  leaseId: z.string(),
  amount,
  dueDate: z.iso.date(),
  ...optionalFields,
});

export const findAllPaymentsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.object({
    field: z.string().optional(),
    order: z.string().optional(),
  }).optional(),
});

export const findByIdPaymentsSchema = z.object({
  id: z.string(),
});

export const updatePaymentsSchema = z.object({
  param: z.object({
    id: z.string(),
  }),
  body: z.object({
    leaseId: z.string().optional(),
    amount: amount.optional(),
    dueDate: z.iso.date().optional(),
    ...optionalFields,
  }),
});

export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentsSchema>;
export type FindAllPayments = z.infer<typeof findAllPaymentsSchema>;
export type FindByIdPayments = z.infer<typeof findByIdPaymentsSchema>;
export type DeletePayment = z.infer<typeof findByIdPaymentsSchema>;


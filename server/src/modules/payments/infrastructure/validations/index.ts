import { z } from "zod";

export const createPaymentSchema = z.object({
  leaseId: z.string(),
  amount: z.number().transform(String),
  dueDate: z.string(),
  paidDate: z.string(),
  paymentMethod: z.string(),
  status: z.string(),
  reference: z.string(),
  receiptFile: z.string(),
  notes: z.string(),
  customFields: z.record(z.string(), z.unknown()),
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
    amount: z.number().transform(String).optional(),
    dueDate: z.string().optional(),
    paidDate: z.string().optional(),
    paymentMethod: z.string().optional(),
    status: z.string().optional(),
    reference: z.string().optional(),
    receiptFile: z.string().optional(),
    notes: z.string().optional(),
    customFields: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentsSchema>;
export type FindAllPayments = z.infer<typeof findAllPaymentsSchema>;
export type FindByIdPayments = z.infer<typeof findByIdPaymentsSchema>;
export type DeletePayment = z.infer<typeof findByIdPaymentsSchema>;


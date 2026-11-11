import { queryOptions } from "@tanstack/react-query";

import { apiRequest, crudClient, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `payments` table as the API returns it (decimals as strings, dates as YYYY-MM-DD). */
export interface Payment {
  id: string;
  leaseId: string;
  userId: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  status: string;
  reference: string | null;
  receiptFile: string | null;
  notes: string | null;
  customFields: unknown;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/payments and /api/payments/:id add the names of the lease's property and renter. */
export type PaymentWithNames = Payment & { propertyName: string; renterName: string };

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Bank transfer" },
  { value: "check", label: "Check" },
  { value: "card", label: "Card" },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]["value"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

/** Body accepted by POST and PUT /api/payments. Nullable columns are cleared with null. */
export interface PaymentInput {
  leaseId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: PaymentMethod | null;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
}

const payments = crudClient<PaymentWithNames, PaymentInput>("/payments");

// Create and update answer with the plain row (no names), so callers refetch the detail.
export const createPayment = (input: PaymentInput) =>
  apiRequest<Payment>("/payments", { method: "POST", body: JSON.stringify(input) });
export const updatePayment = (id: string, input: PaymentInput) =>
  apiRequest<Payment>(`/payments/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deletePayment = payments.remove;

export const paymentsQueryKey = ["payments"] as const;

export const getAllPaymentsQueryOptions = queryOptions({
  queryKey: paymentsQueryKey,
  queryFn: payments.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getPaymentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...paymentsQueryKey, id],
    queryFn: () => payments.get(id),
    retry: retryServerErrors,
  });

export const paymentMethodLabel = (method: string | null) =>
  method === null ? null : (PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method);

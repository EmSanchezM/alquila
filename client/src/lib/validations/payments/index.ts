import { z } from "zod";

import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type Payment,
  type PaymentInput,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/services/payments";

const statuses: string[] = PAYMENT_STATUSES.map((s) => s.value);
const methods: string[] = PAYMENT_METHODS.map((m) => m.value);

/** Select value for "no method"; a Select item cannot have an empty value. */
export const NO_METHOD = "none";

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `payments` table.
export const PaymentFormValidation = z
  .object({
    leaseId: z.string().min(1, "Select a lease"),
    amount: z
      .string()
      .trim()
      .min(1, "Enter an amount")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount with up to 2 decimals")
      .refine((v) => Number(v) > 0, "Enter an amount greater than 0")
      .refine((v) => Number(v) <= 99_999_999.99, "Use an amount up to 99999999.99"),
    dueDate: z.iso.date("Enter a due date"),
    paidDate: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
    paymentMethod: z.string().refine((v) => v === NO_METHOD || methods.includes(v), "Select a method"),
    status: z.string().refine((v) => statuses.includes(v), "Select a status"),
    reference: z.string().trim().max(100, "Use 100 characters or fewer"),
    // Set by the upload, not typed: the receipt's URL and a name to show.
    receiptFile: z.string(),
    receiptName: z.string(),
    notes: z.string(),
  })
  .refine((v) => !(v.status === "paid" || v.status === "partial") || v.paidDate !== "", {
    message: "Enter the date it was paid",
    path: ["paidDate"],
  });

export type PaymentFormValues = z.infer<typeof PaymentFormValidation>;

export const emptyPaymentForm: PaymentFormValues = {
  leaseId: "",
  amount: "",
  dueDate: "",
  paidDate: "",
  paymentMethod: NO_METHOD,
  status: "pending",
  reference: "",
  receiptFile: "",
  receiptName: "",
  notes: "",
};

export function toPaymentForm(payment: Payment): PaymentFormValues {
  return {
    leaseId: payment.leaseId,
    amount: String(Number(payment.amount)),
    dueDate: payment.dueDate,
    paidDate: payment.paidDate ?? "",
    // Unknown legacy values are left blank so the user picks a valid one instead of them changing silently.
    paymentMethod: payment.paymentMethod === null ? NO_METHOD : methods.includes(payment.paymentMethod) ? payment.paymentMethod : "",
    status: statuses.includes(payment.status) ? payment.status : "",
    reference: payment.reference ?? "",
    receiptFile: payment.receiptFile ?? "",
    receiptName: payment.receiptFile ? "Current receipt" : "",
    notes: payment.notes ?? "",
  };
}

/** Blank optional fields become null, so editing can clear them. */
/**
 * When editing, the stored receipt is only sent if it changed: a receipt saved before the file
 * storage existed (any string) would otherwise fail validation on every edit.
 */
export function toPaymentInput(values: PaymentFormValues, original?: Payment): PaymentInput {
  const receiptUnchanged = original !== undefined && values.receiptFile === (original.receiptFile ?? "");
  return {
    leaseId: values.leaseId,
    amount: Number(values.amount),
    dueDate: values.dueDate,
    paidDate: values.paidDate === "" ? null : values.paidDate,
    paymentMethod: values.paymentMethod === NO_METHOD ? null : (values.paymentMethod as PaymentMethod),
    status: values.status as PaymentStatus,
    reference: values.reference.trim() === "" ? null : values.reference.trim(),
    ...(receiptUnchanged ? {} : { receiptFile: values.receiptFile === "" ? null : values.receiptFile }),
    notes: values.notes.trim() === "" ? null : values.notes,
  };
}

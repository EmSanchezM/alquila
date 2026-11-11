import { z } from "zod";
import type { Lease } from "shared";

import { LEASE_STATUSES, type LeaseCreateInput, type LeaseStatus, type LeaseUpdateInput } from "@/lib/services/leases";

const statuses = LEASE_STATUSES.map((s) => s.value) as [LeaseStatus, ...LeaseStatus[]];

const money = (required: boolean) =>
  z
    .string()
    .trim()
    .refine((v) => !required || v !== "", "Enter an amount")
    .refine((v) => /^(\d+(\.\d{1,2})?)?$/.test(v), "Enter an amount with up to 2 decimals")
    .refine((v) => v === "" || Number(v) <= 99_999_999.99, "Use an amount up to 99999999.99");

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `leases` table.
export const LeaseFormValidation = z
  .object({
    propertyId: z.string().min(1, "Select a property"),
    renterId: z.string().min(1, "Select a renter"),
    startDate: z.iso.date("Enter a start date"),
    endDate: z.iso.date("Enter an end date"),
    monthlyRent: money(true),
    securityDeposit: money(false),
    paymentDueDay: z
      .string()
      .trim()
      .regex(/^\d+$/, "Enter a day from 1 to 31")
      .refine((v) => Number(v) >= 1 && Number(v) <= 31, "Enter a day from 1 to 31"),
    status: z.string().refine((v) => (statuses as string[]).includes(v), "Select a status"),
    terms: z.string(),
    autoRenew: z.boolean(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type LeaseFormValues = z.infer<typeof LeaseFormValidation>;

export const emptyLeaseForm: LeaseFormValues = {
  propertyId: "",
  renterId: "",
  startDate: "",
  endDate: "",
  monthlyRent: "",
  securityDeposit: "",
  paymentDueDay: "1",
  status: "active",
  terms: "",
  autoRenew: false,
};

const amount = (value: string | null) => (value === null ? "" : String(Number(value)));

export function toLeaseForm(lease: Lease): LeaseFormValues {
  return {
    propertyId: lease.propertyId,
    renterId: lease.renterId,
    startDate: lease.startDate,
    endDate: lease.endDate,
    monthlyRent: amount(lease.monthlyRent),
    securityDeposit: amount(lease.securityDeposit),
    paymentDueDay: String(lease.paymentDueDay),
    // An unknown legacy status is left blank so the user picks a valid one instead of it changing silently.
    status: (statuses as string[]).includes(lease.status) ? lease.status : "",
    terms: lease.terms ?? "",
    autoRenew: lease.autoRenew ?? false,
  };
}

/** Blank optional fields become null, so editing can clear them. */
export function toLeaseUpdateInput(values: LeaseFormValues): LeaseUpdateInput {
  return {
    startDate: values.startDate,
    endDate: values.endDate,
    monthlyRent: Number(values.monthlyRent),
    securityDeposit: values.securityDeposit.trim() === "" ? null : Number(values.securityDeposit),
    paymentDueDay: Number(values.paymentDueDay),
    status: values.status as LeaseStatus,
    terms: values.terms.trim() === "" ? null : values.terms,
    autoRenew: values.autoRenew,
  };
}

export function toLeaseCreateInput(values: LeaseFormValues): LeaseCreateInput {
  return { propertyId: values.propertyId, renterId: values.renterId, ...toLeaseUpdateInput(values) };
}

import { z } from "zod";
import type { Renter } from "shared";

import { emergencyContactOf, VERIFICATION_STATUSES, type RenterInput } from "@/lib/services/renters";

const statuses = VERIFICATION_STATUSES.map((s) => s.value) as [string, ...string[]];

// Form values are strings, as typed in the inputs. Limits mirror the server schema
// and the `renters` table.
export const RenterFormValidation = z
  .object({
    firstName: z.string().trim().min(1, "Enter a first name").max(100, "Use 100 characters or fewer"),
    lastName: z.string().trim().min(1, "Enter a last name").max(100, "Use 100 characters or fewer"),
    email: z.union([z.literal(""), z.email("Enter a valid email").max(255, "Use 255 characters or fewer")]),
    phoneNumber: z.string().trim().max(20, "Use 20 characters or fewer"),
    dniNumber: z.string().trim().max(50, "Use 50 characters or fewer"),
    verificationStatus: z.enum(statuses),
    contactName: z.string().trim(),
    contactPhone: z.string().trim(),
    contactRelationship: z.string().trim(),
    notes: z.string(),
  })
  .refine((v) => v.contactName !== "" || (v.contactPhone === "" && v.contactRelationship === ""), {
    message: "Enter the contact's name",
    path: ["contactName"],
  });

export type RenterFormValues = z.infer<typeof RenterFormValidation>;

export const emptyRenterForm: RenterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dniNumber: "",
  verificationStatus: "pending",
  contactName: "",
  contactPhone: "",
  contactRelationship: "",
  notes: "",
};

export function toRenterForm(renter: Renter): RenterFormValues {
  const contact = emergencyContactOf(renter);
  return {
    firstName: renter.firstName,
    lastName: renter.lastName,
    email: renter.email ?? "",
    phoneNumber: renter.phoneNumber ?? "",
    dniNumber: renter.dniNumber ?? "",
    verificationStatus: renter.verificationStatus ?? "pending",
    contactName: contact?.name ?? "",
    contactPhone: contact?.phone ?? "",
    contactRelationship: contact?.relationship ?? "",
    notes: renter.notes ?? "",
  };
}

/** Blank optional fields become null, so editing can clear them. */
export function toRenterInput(values: RenterFormValues): RenterInput {
  const orNull = (value: string) => (value.trim() === "" ? null : value.trim());

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: orNull(values.email),
    phoneNumber: orNull(values.phoneNumber),
    dniNumber: orNull(values.dniNumber),
    verificationStatus: values.verificationStatus as RenterInput["verificationStatus"],
    emergencyContact: values.contactName.trim() === ""
      ? null
      : { name: values.contactName.trim(), phone: values.contactPhone.trim(), relationship: values.contactRelationship.trim() },
    notes: values.notes.trim() === "" ? null : values.notes,
  };
}

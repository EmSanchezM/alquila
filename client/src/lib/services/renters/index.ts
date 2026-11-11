import { queryOptions } from "@tanstack/react-query";
import type { Renter } from "shared";

import { crudClient, retryServerErrors } from "@/lib/services/api-client";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/** Body accepted by POST and PUT /api/renters. Nullable columns are cleared with null. */
export interface RenterInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dniNumber: string | null;
  emergencyContact: EmergencyContact | null;
  verificationStatus: VerificationStatus;
  notes: string | null;
}

export const VERIFICATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]["value"];

const renters = crudClient<Renter, RenterInput>("/renters");

export const createRenter = renters.create;
export const updateRenter = renters.update;
export const deleteRenter = renters.remove;

export const rentersQueryKey = ["renters"] as const;

export const getAllRentersQueryOptions = queryOptions({
  queryKey: rentersQueryKey,
  queryFn: renters.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getRenterQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...rentersQueryKey, id],
    queryFn: () => renters.get(id),
    retry: retryServerErrors,
  });

export const renterName = (renter: Pick<Renter, "firstName" | "lastName">) => `${renter.firstName} ${renter.lastName}`;

/** The column is json; only an object with a name is shown. */
export function emergencyContactOf(renter: Renter): EmergencyContact | null {
  const contact = renter.emergencyContact as Partial<EmergencyContact> | null;
  if (!contact || typeof contact !== "object" || !contact.name) return null;
  return { name: contact.name, phone: contact.phone ?? "", relationship: contact.relationship ?? "" };
}

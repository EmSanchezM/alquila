import { queryOptions } from "@tanstack/react-query";
import type { Lease } from "shared";

import { apiRequest, crudClient, retryServerErrors } from "@/lib/services/api-client";

/** GET /api/leases and /api/leases/:id add the names of the property and the renter. */
export type LeaseWithNames = Lease & { propertyName: string; renterName: string };

export const LEASE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
] as const;

export type LeaseStatus = (typeof LEASE_STATUSES)[number]["value"];

/** Fields PUT /api/leases/:id accepts. Nullable columns are cleared with null. */
export interface LeaseUpdateInput {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number | null;
  paymentDueDay: number;
  status: LeaseStatus;
  terms: string | null;
  autoRenew: boolean;
}

/** POST /api/leases also takes the property and the renter, which cannot change afterwards. */
export interface LeaseCreateInput extends LeaseUpdateInput {
  propertyId: string;
  renterId: string;
}

const leases = crudClient<LeaseWithNames, LeaseUpdateInput>("/leases");

// Create and update answer with the plain row (no names), so callers refetch the detail.
export const createLease = (input: LeaseCreateInput) =>
  apiRequest<Lease>("/leases", { method: "POST", body: JSON.stringify(input) });
export const updateLease = (id: string, input: LeaseUpdateInput) =>
  apiRequest<Lease>(`/leases/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteLease = leases.remove;

export const leasesQueryKey = ["leases"] as const;

export const getAllLeasesQueryOptions = queryOptions({
  queryKey: leasesQueryKey,
  queryFn: leases.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getLeaseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...leasesQueryKey, id],
    queryFn: () => leases.get(id),
    retry: retryServerErrors,
  });

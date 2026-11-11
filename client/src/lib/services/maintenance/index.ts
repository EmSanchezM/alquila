import { queryOptions } from "@tanstack/react-query";

import { apiRequest, crudClient, retryServerErrors } from "@/lib/services/api-client";

/** A row of the `maintenance_requests` table as the API returns it (timestamps as ISO strings). */
export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  renterId: string | null;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reportedDate: string;
  scheduledDate: string | null;
  completedDate: string | null;
  assignedTo: string | null;
  estimatedCost: string | null;
  actualCost: string | null;
  photos: unknown;
  notes: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/maintenance-requests and /:id add the property name, and the renter name when there is one. */
export type MaintenanceRequestWithNames = MaintenanceRequest & { propertyName: string; renterName: string | null };

export const MAINTENANCE_CATEGORIES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "appliances", label: "Appliances" },
  { value: "general", label: "General" },
] as const;

export const MAINTENANCE_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const MAINTENANCE_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
] as const;

/** Body accepted by POST and PUT /api/maintenance-requests. Nullable columns are cleared with null. */
export interface MaintenanceRequestInput {
  propertyId: string;
  renterId: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reportedDate: string;
  scheduledDate: string | null;
  completedDate: string | null;
  assignedTo: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  /** Uploaded image URLs; left out on edit when unchanged, so stored photos are kept. */
  photos?: string[];
  notes: string | null;
}

/** The request's photo URLs (the column is json). */
export const photosOf = (request: Pick<MaintenanceRequest, "photos">): string[] =>
  Array.isArray(request.photos) ? request.photos.filter((url): url is string => typeof url === "string") : [];

const BASE = "/maintenance-requests";
const requests = crudClient<MaintenanceRequestWithNames, MaintenanceRequestInput>(BASE);

// Create and update answer with the plain row (no names), so callers refetch the detail.
export const createMaintenanceRequest = (input: MaintenanceRequestInput) =>
  apiRequest<MaintenanceRequest>(BASE, { method: "POST", body: JSON.stringify(input) });
export const updateMaintenanceRequest = (id: string, input: MaintenanceRequestInput) =>
  apiRequest<MaintenanceRequest>(`${BASE}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
export const deleteMaintenanceRequest = requests.remove;

export const maintenanceQueryKey = ["maintenance-requests"] as const;

export const getAllMaintenanceRequestsQueryOptions = queryOptions({
  queryKey: maintenanceQueryKey,
  queryFn: requests.getAll,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getMaintenanceRequestQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...maintenanceQueryKey, id],
    queryFn: () => requests.get(id),
    retry: retryServerErrors,
  });

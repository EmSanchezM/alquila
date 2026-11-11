import { queryOptions } from "@tanstack/react-query";
import type { Property } from "shared";

// TODO: Switch to the typed `api` client once the server routers keep their route types
// (each router is declared as `new Hono()` and chained without reassignment, so ApiRoutes is empty).

/** Body accepted by POST and PUT /api/properties. Nullable columns are cleared with null. */
export interface PropertyInput {
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  state: string | null;
  zipCode: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  description: string | null;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/properties${path}`, {
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.message ?? "Something went wrong. Try again.", response.status);
  }

  return body.data as T;
}

export const getAllProperties = () => request<Property[]>("");

export const getProperty = (id: string) => request<Property>(`/${encodeURIComponent(id)}`);

export const createProperty = (input: PropertyInput) =>
  request<Property>("", { method: "POST", body: JSON.stringify(input) });

export const updateProperty = (id: string, input: PropertyInput) =>
  request<Property>(`/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });

export const deleteProperty = (id: string) =>
  request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" });

export const propertiesQueryKey = ["properties"] as const;

// A 4xx (e.g. 404 for a missing property) will not change on retry; show it right away.
const retryServerErrors = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 3;

export const getAllPropertiesQueryOptions = queryOptions({
  queryKey: propertiesQueryKey,
  queryFn: getAllProperties,
  staleTime: 1000 * 60 * 5,
  retry: retryServerErrors,
});

export const getPropertyQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...propertiesQueryKey, id],
    queryFn: () => getProperty(id),
    retry: retryServerErrors,
  });

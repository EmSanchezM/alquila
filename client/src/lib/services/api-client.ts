// TODO: Switch to the typed `api` client once the server routers keep their route types
// (each router is declared as `new Hono()` and chained without reassignment, so ApiRoutes is empty).

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Calls `/api<path>` and returns the `data` field of a `{ success, data }` response. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.message ?? "Something went wrong. Try again.", response.status);
  }

  return body.data as T;
}

/** CRUD calls for one API module, e.g. `crudClient<Renter, RenterInput>("/renters")`. */
export function crudClient<T, Input>(basePath: string) {
  const one = (id: string) => `${basePath}/${encodeURIComponent(id)}`;

  return {
    getAll: () => apiRequest<T[]>(basePath),
    get: (id: string) => apiRequest<T>(one(id)),
    create: (input: Input) => apiRequest<T>(basePath, { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Input) => apiRequest<T>(one(id), { method: "PUT", body: JSON.stringify(input) }),
    remove: (id: string) => apiRequest<void>(one(id), { method: "DELETE" }),
  };
}

// A 4xx (e.g. 404 for a missing record) will not change on retry; show it right away.
export const retryServerErrors = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 3;

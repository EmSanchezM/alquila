import { hc } from "hono/client";
// TODO: Move ApiRoutes type to shared package
import type { ApiRoutes } from "server";

/**
 * Typed API client for server communication
 * Provides full TypeScript autocompletion for all API endpoints
 */
export const api = hc<ApiRoutes>("/");
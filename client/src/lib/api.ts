import { hc } from "hono/client";
import { type ApiRoutes } from "@server/app";

export const api = hc<ApiRoutes>("/api");
import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors"

import propertyRouter from "./modules/properties/presentation/routes";
import renterRouter from "./modules/renters/presentation/routes";
import leaseRouter from "./modules/leases/presentation/routes";
import expenseRouter from "./modules/expenses/presentation/routes";
import maintenanceRequestRouter from "./modules/maintenance-request/presentation/routes";
import documentRouter from "./modules/documents/presentation/routes";
import paymentRouter from "./modules/payments/presentation/routes";

const app = new Hono()
app.use("*", logger());
app.use("*", cors({
  origin: "*",
  credentials: true,
}));

const api = new Hono()
  .route("/properties", propertyRouter)
  .route("/renters", renterRouter)
  .route("/leases", leaseRouter)
  .route("/expenses", expenseRouter)
  .route("/maintenance-requests", maintenanceRequestRouter)
  .route("/documents", documentRouter)
  .route("/payments", paymentRouter);

app.route("/api", api);

app.get("*", serveStatic({ root: "./client/dist" }))
app.get("*", serveStatic({ path: "./client/dist/index.html" }))

export default app;
export type ApiRoutes = typeof api;
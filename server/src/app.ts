import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

import propertyRouter from "./modules/properties/presentation/routes";
import renterRouter from "./modules/renters/presentation/routes";
import leaseRouter from "./modules/leases/presentation/routes";
import expenseRouter from "./modules/expenses/presentation/routes";

const app = new Hono()
app.use("*", logger());

const apiRoutes = app.basePath("/api")
    .route("/properties", propertyRouter)
    .route("/renters", renterRouter)
    .route("/leases", leaseRouter)
    .route("/expenses", expenseRouter);

app.get("*", serveStatic({ root: "./client/dist" }))
app.get("*", serveStatic({ path: "./client/dist/index.html" }))

export default app;
export type ApiRoutes = typeof apiRoutes
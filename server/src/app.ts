import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

import propertyRouter from "./modules/properties/presentation/routes";
import renterRouter from "./modules/renters/presentation/routes";

const app = new Hono()
app.use("*", logger());

const apiRoutes = app.basePath("/api")
    .route("/properties", propertyRouter)
    .route("/renters", renterRouter);

app.get("*", serveStatic({ root: "./frontend/dist" }))
app.get("*", serveStatic({ path: "./frontend/dist/index.html" }))

export default app;
export type ApiRoutes = typeof apiRoutes
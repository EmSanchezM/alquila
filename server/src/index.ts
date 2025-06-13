import { Hono } from "hono";
import { cors } from "hono/cors";
import { hc } from "hono/client";

import propertyRouter from "./modules/properties/presentation/routes";

const app = new Hono()
app.use(cors())

app.route("/api/properties", propertyRouter);

const client = hc<typeof app>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
hc<typeof app>(...args);

export default app;
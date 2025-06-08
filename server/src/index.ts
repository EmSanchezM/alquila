import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { hc } from "hono/client";
import { db } from "./db";
import { testTable } from "./db/schema";

export const app = new Hono()

.use(cors())

.get("/", (c) => {
	return c.text("Hello Hono!");
})

.get("/hello", async (c) => {
	
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
})

.get("/test-db", async (c) => {
	try {
		// Try to insert a test record
		const result = await db.insert(testTable).values({
			name: "Test Connection",
		}).returning();

		return c.json({
			success: true,
			message: "Database connection successful",
			data: result
		});
	} catch (error) {
		console.error("Database connection error:", error);
		return c.json({
			success: false,
			message: "Database connection failed",
			error: error instanceof Error ? error.message : "Unknown error"
		}, 500);
	}
});

const client = hc<typeof app>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
hc<typeof app>(...args);

export default app;
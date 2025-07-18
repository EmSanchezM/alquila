import app from "@server/app";
import { ProcessEnv } from "./shared/environment";

const server = Bun.serve({
  port: ProcessEnv.PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(`Server running on http://localhost:${server.port}`);
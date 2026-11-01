import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { createFixtures, moduleCases } from "./helpers";

const f = createFixtures();

beforeAll(f.seed);
afterAll(f.cleanup);

describe("POST create returns the persisted row", () => {
  for (const c of moduleCases(f)) {
    test(c.name, async () => {
      const body = c.body();
      const { status, json } = await f.request("POST", c.path, body);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(typeof json.data?.id).toBe("string");
      expect(json.data[c.field]).toBe(body[c.field]);
      f.created[c.name].push(json.data.id);
    });
  }
});

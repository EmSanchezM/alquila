import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@server/database";
import { communicationTemplates } from "@server/database/schema";
import { createFixtures, request, signUp } from "./helpers";

const f = createFixtures();
const { tag } = f;
let stranger: { userId: string, cookie: string };

beforeAll(async () => {
  await f.seed();
  stranger = await signUp(`${tag}-tpl-stranger`);
});
afterAll(async () => {
  await db.delete(communicationTemplates).where(eq(communicationTemplates.userId, f.userId));
  await db.delete(communicationTemplates).where(eq(communicationTemplates.userId, stranger.userId));
  await f.cleanup();
});

const reminder = () => ({
  name: `Reminder ${tag}`,
  type: "email",
  category: "payment_reminder",
  subject: "Rent due for {{property_name}}",
  content: "Hi {{tenant_name}}, your rent of {{amount}} is due on {{due_date}}. Thanks, {{tenant_name}}!",
});

describe("POST /communication-templates", () => {
  test("creates a template and lists the variables it uses, once each", async () => {
    const { status, json } = await f.request("POST", "/communication-templates", reminder());

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ name: `Reminder ${tag}`, type: "email", category: "payment_reminder", isActive: true });
    expect(json.data.variables).toEqual(["property_name", "tenant_name", "amount", "due_date"]);
  });

  test("an SMS template without subject or variables", async () => {
    const { status, json } = await f.request("POST", "/communication-templates", { name: `Hello ${tag}`, type: "sms", category: "general", content: "Hello!" });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({ subject: null, variables: [] });
  });

  test("rejects an unknown variable with 400 and names it", async () => {
    const { status, json } = await f.request("POST", "/communication-templates", { ...reminder(), content: "Hi {{tenant_name}}, see you at {{meeting_time}}" });

    expect(status).toBe(400);
    expect(json).toEqual({ success: false, message: "Unknown variable {{meeting_time}}. Use tenant_name, property_name, amount or due_date" });
  });

  const invalid: [string, Record<string, unknown>][] = [
    ["name over 100 characters", { name: "x".repeat(101) }],
    ["unknown type", { type: "fax" }],
    ["unknown category", { category: "party" }],
    ["subject over 200 characters", { subject: "x".repeat(201) }],
    ["empty content", { content: "" }],
  ];
  for (const [label, override] of invalid) {
    test(`rejects ${label} with 400`, async () => {
      const { status, json } = await f.request("POST", "/communication-templates", { ...reminder(), ...override });

      expect(status).toBe(400);
      expect(json.success).toBe(false);
    });
  }
});

describe("templates are per user, editable and soft deleted", () => {
  test("list and detail only show the user's templates", async () => {
    const mine = (await f.request("POST", "/communication-templates", reminder())).json.data;
    const theirs = (await request("POST", "/communication-templates", { ...reminder(), name: `Theirs ${tag}` }, stranger.cookie)).json.data;

    const list = await f.request("GET", "/communication-templates");
    const ids = (list.json.data as { id: string }[]).map((t) => t.id);
    expect(ids).toContain(mine.id);
    expect(ids).not.toContain(theirs.id);
    expect((await f.request("GET", `/communication-templates/${theirs.id}`)).status).toBe(404);
    expect((await f.request("PUT", `/communication-templates/${theirs.id}`, { name: "x" })).status).toBe(404);
    expect((await f.request("DELETE", `/communication-templates/${theirs.id}`)).status).toBe(404);
  });

  test("PUT updates the content and recomputes the variables; rejects unknown ones", async () => {
    const created = (await f.request("POST", "/communication-templates", reminder())).json.data;

    const updated = await f.request("PUT", `/communication-templates/${created.id}`, { subject: null, content: "Welcome {{tenant_name}} to {{property_name}}" });
    expect(updated.status).toBe(200);
    expect(updated.json.data).toMatchObject({ subject: null, variables: ["tenant_name", "property_name"], name: `Reminder ${tag}` });

    expect((await f.request("PUT", `/communication-templates/${created.id}`, { content: "{{nope}}" })).status).toBe(400);
  });

  test("DELETE hides the template", async () => {
    const created = (await f.request("POST", "/communication-templates", reminder())).json.data;

    expect((await f.request("DELETE", `/communication-templates/${created.id}`)).status).toBe(200);
    expect((await f.request("GET", `/communication-templates/${created.id}`)).status).toBe(404);
    const list = await f.request("GET", "/communication-templates");
    expect((list.json.data as { id: string }[]).some((t) => t.id === created.id)).toBe(false);
  });
});

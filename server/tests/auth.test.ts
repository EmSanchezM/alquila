import { afterAll, describe, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";

import app from "@server/app";
import { db } from "@server/database";
import { account, users } from "@server/database/schema";

const tag = `auth-${Date.now()}`;
const email = `${tag}@test.com`;
const password = "correct-horse-battery";
const createdUserIds: string[] = [];

afterAll(async () => {
  if (createdUserIds.length) await db.delete(users).where(inArray(users.id, createdUserIds));
});

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return app.request(`/api/auth${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", ...headers },
    body: JSON.stringify(body),
  });
}

function sessionCookie(res: Response) {
  return res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

describe("email and password", () => {
  test("sign up stores the user with first and last name and a hashed credential", async () => {
    const res = await post("/sign-up/email", { name: "Ana Ruiz", email, password, firstName: "Ana", lastName: "Ruiz" });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    createdUserIds.push(json.user.id);
    expect(json.user.id).toHaveLength(36);

    const [user] = await db.select().from(users).where(eq(users.id, json.user.id));
    expect(user).toMatchObject({ email, name: "Ana Ruiz", firstName: "Ana", lastName: "Ruiz", emailVerified: false });

    const [credential] = await db.select().from(account).where(eq(account.userId, json.user.id));
    expect(credential?.providerId).toBe("credential");
    expect(credential?.password).toBeString();
    expect(credential?.password).not.toBe(password);
  });

  test("sign up without first and last name is rejected", async () => {
    const res = await post("/sign-up/email", { name: "No Names", email: `nonames-${email}`, password });

    expect(res.status).toBe(400);
    const [user] = await db.select().from(users).where(eq(users.email, `nonames-${email}`));
    expect(user).toBeUndefined();
  });

  test("sign in returns a session cookie that resolves the user", async () => {
    const signIn = await post("/sign-in/email", { email, password });
    expect(signIn.status).toBe(200);

    const cookie = sessionCookie(signIn);
    expect(cookie).toContain("session_token");

    const session = await app.request("/api/auth/get-session", { headers: { cookie } });
    const json = (await session.json()) as any;
    expect(json.user.email).toBe(email);
    expect(json.user.firstName).toBe("Ana");
  });

  test("wrong password is rejected", async () => {
    const res = await post("/sign-in/email", { email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(sessionCookie(res)).not.toContain("session_token=");
  });

  test("sign out invalidates the session", async () => {
    const cookie = sessionCookie(await post("/sign-in/email", { email, password }));

    const out = await post("/sign-out", {}, { cookie });
    expect(out.status).toBe(200);

    const session = await app.request("/api/auth/get-session", { headers: { cookie } });
    expect(await session.json()).toBeNull();
  });
});

describe("existing users", () => {
  test("rows created before better-auth keep their data", async () => {
    const id = `legacy-${tag}`;
    await db.insert(users).values({ id, email: `legacy-${email}`, password: "legacy-hash", firstName: "Old", lastName: "User", name: "Old User" });
    createdUserIds.push(id);

    const [row] = await db.select().from(users).where(eq(users.id, id));
    expect(row).toMatchObject({ password: "legacy-hash", firstName: "Old", lastName: "User", emailVerified: false, maxProperties: 3 });
  });
});

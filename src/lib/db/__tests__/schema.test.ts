import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "@/test/db";
import { user } from "@/lib/db/schema";

describe("user table", () => {
  let db: Awaited<ReturnType<typeof createTestDb>>["db"];
  let client: Awaited<ReturnType<typeof createTestDb>>["client"];

  beforeEach(async () => {
    ({ db, client } = await createTestDb());
  });

  afterEach(async () => {
    await client.close();
  });

  it("should insert and retrieve a user", async () => {
    const now = new Date();

    await db.insert(user).values({
      id: "test-user-1",
      name: "Jean Dupont",
      email: "jean@example.com",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.id, "test-user-1"));

    expect(found).toBeDefined();
    expect(found.name).toBe("Jean Dupont");
    expect(found.email).toBe("jean@example.com");
  });

  it("should enforce unique email constraint", async () => {
    const now = new Date();
    const values = {
      name: "Test",
      email: "duplicate@example.com",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(user).values({ ...values, id: "user-1" });

    await expect(
      db.insert(user).values({ ...values, id: "user-2" }),
    ).rejects.toThrow();
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb } from "@/test/db";
import { user } from "@/lib/db/schema/auth";
import {
  establishment,
  suite,
  booking,
} from "@/lib/db/schema/domain";

describe("database schema", () => {
  let db: Awaited<ReturnType<typeof createTestDb>>["db"];
  let client: Awaited<ReturnType<typeof createTestDb>>["client"];

  beforeEach(async () => {
    ({ db, client } = await createTestDb());
  });

  afterEach(async () => {
    await client.close();
  });

  it("should create all tables from the migration", async () => {
    const result = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    const tables = result.rows.map((r) => r.tablename);

    expect(tables).toContain("user");
    expect(tables).toContain("establishment");
    expect(tables).toContain("suite");
    expect(tables).toContain("booking");
    expect(tables).toContain("review");
    expect(tables).toContain("inquiry");
  });

  it("should enforce booking check constraint (check_out > check_in)", async () => {
    const now = new Date();

    await db.insert(user).values({
      id: "manager-1",
      name: "Manager",
      email: "manager@test.com",
      emailVerified: false,
      role: "manager",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(establishment).values({
      id: "etab-1",
      name: "Clair de Lune",
      address: "1 rue de la Lune",
      postalCode: "59000",
      city: "Lille",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      managerId: "manager-1",
    });

    await db.insert(suite).values({
      id: "suite-1",
      title: "Suite Royale",
      price: "150.00",
      mainImage: "/images/suite-1.jpg",
      capacity: 2,
      establishmentId: "etab-1",
    });

    await db.insert(user).values({
      id: "client-1",
      name: "Client",
      email: "client@test.com",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    await expect(
      db.insert(booking).values({
        id: "booking-1",
        reference: "REF-001",
        checkIn: new Date("2026-04-10"),
        checkOut: new Date("2026-04-08"), // before check_in — should fail
        guestCount: 2,
        pricePerNight: "150.00",
        totalPrice: "300.00",
        status: "confirmed",
        clientId: "client-1",
        suiteId: "suite-1",
      }),
    ).rejects.toThrow();
  });

  it("should enforce suite price positive constraint", async () => {
    const now = new Date();

    await db.insert(user).values({
      id: "manager-1",
      name: "Manager",
      email: "manager@test.com",
      emailVerified: false,
      role: "manager",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(establishment).values({
      id: "etab-1",
      name: "Clair de Lune",
      address: "1 rue de la Lune",
      postalCode: "59000",
      city: "Lille",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      managerId: "manager-1",
    });

    await expect(
      db.insert(suite).values({
        id: "suite-bad",
        title: "Suite Gratuite",
        price: "-10.00",
        mainImage: "/images/suite.jpg",
        capacity: 2,
        establishmentId: "etab-1",
      }),
    ).rejects.toThrow();
  });

  it("should cascade delete suites when establishment FK is restrict", async () => {
    const now = new Date();

    await db.insert(user).values({
      id: "manager-1",
      name: "Manager",
      email: "manager@test.com",
      emailVerified: false,
      role: "manager",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(establishment).values({
      id: "etab-1",
      name: "Clair de Lune",
      address: "1 rue de la Lune",
      postalCode: "59000",
      city: "Lille",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      managerId: "manager-1",
    });

    await db.insert(suite).values({
      id: "suite-1",
      title: "Suite Royale",
      price: "150.00",
      mainImage: "/images/suite-1.jpg",
      capacity: 2,
      establishmentId: "etab-1",
    });

    // Deleting establishment with existing suites should fail (ON DELETE RESTRICT)
    await expect(
      db.delete(establishment).where(eq(establishment.id, "etab-1")),
    ).rejects.toThrow();
  });
});

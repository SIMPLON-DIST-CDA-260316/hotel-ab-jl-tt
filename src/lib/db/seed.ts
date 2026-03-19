import { db } from "@/lib/db";
import { user, establishment, suite, booking } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ROLES } from "@/config/roles";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

async function seed() {
  // Clean seed data for idempotence (order respects FK constraints)
  await db.delete(booking);
  await db.delete(suite);
  await db.delete(establishment);
  await db.delete(user).where(eq(user.id, "seed-manager-1"));
  await db.delete(user).where(eq(user.id, "seed-client-1"));

  await db.insert(user).values({
    id: "seed-manager-1",
    name: "Gérant Test",
    email: "gerant@clairdelune.test",
    emailVerified: true,
    role: ROLES.MANAGER,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(user).values({
    id: "seed-client-1",
    name: "Client Test",
    email: "client@clairdelune.test",
    emailVerified: true,
    role: ROLES.CLIENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const managerId = "seed-manager-1";

  const establishments = await db
    .insert(establishment)
    .values([
      {
        name: "Clair de Lune — Paris",
        address: "12 rue de Rivoli",
        postalCode: "75001",
        city: "Paris",
        description: "Un havre de paix au cœur de la capitale.",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId,
      },
      {
        name: "Clair de Lune — Lyon",
        address: "45 quai Saint-Antoine",
        postalCode: "69002",
        city: "Lyon",
        description: "Vue imprenable sur la Saône.",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        managerId,
      },
      {
        name: "Clair de Lune — Lille",
        address: "8 place du Général de Gaulle",
        postalCode: "59000",
        city: "Lille",
        description: "Charme et convivialité dans le Vieux-Lille.",
        checkInTime: "15:00",
        checkOutTime: "10:30",
        managerId,
      },
    ])
    .returning({ id: establishment.id, city: establishment.city });

  const parisId = establishments.find((e) => e.city === "Paris")!.id;
  const lyonId = establishments.find((e) => e.city === "Lyon")!.id;
  const lilleId = establishments.find((e) => e.city === "Lille")!.id;

  const suites = await db
    .insert(suite)
    .values([
      {
        title: "Suite Étoile",
        description: "Suite luxueuse avec vue sur la Tour Eiffel.",
        price: "250.00",
        mainImage: "/placeholder-suite.jpg",
        capacity: 2,
        area: "45.00",
        establishmentId: parisId,
      },
      {
        title: "Suite Lumière",
        description: "Ambiance tamisée et décoration Art Déco.",
        price: "180.00",
        mainImage: "/placeholder-suite.jpg",
        capacity: 2,
        area: "35.00",
        establishmentId: parisId,
      },
      {
        title: "Suite Confluence",
        description: "Au croisement du Rhône et de la Saône.",
        price: "200.00",
        mainImage: "/placeholder-suite.jpg",
        capacity: 3,
        area: "50.00",
        establishmentId: lyonId,
      },
      {
        title: "Suite Grand Place",
        description: "Vue sur la Grand Place de Lille.",
        price: "160.00",
        mainImage: "/placeholder-suite.jpg",
        capacity: 2,
        area: "38.00",
        establishmentId: lilleId,
      },
    ])
    .returning({ id: suite.id, title: suite.title });

  const suiteEtoileId = suites.find((s) => s.title === "Suite Étoile")!.id;
  const suiteConfluenceId = suites.find(
    (s) => s.title === "Suite Confluence",
  )!.id;

  // Booking future (Paris) — bloque la suppression de l'établissement Paris
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthEnd = new Date(nextMonth);
  nextMonthEnd.setDate(nextMonthEnd.getDate() + 3);

  // Booking passée (Lyon) — ne bloque PAS la suppression de l'établissement Lyon
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthEnd = new Date(lastMonth);
  lastMonthEnd.setDate(lastMonthEnd.getDate() + 2);

  await db.insert(booking).values([
    {
      reference: "SEED-FUTURE-001",
      checkIn: nextMonth,
      checkOut: nextMonthEnd,
      guestCount: 2,
      pricePerNight: "250.00",
      totalPrice: "750.00",
      status: BOOKING_STATUSES.CONFIRMED,
      clientId: "seed-client-1",
      suiteId: suiteEtoileId,
    },
    {
      reference: "SEED-PAST-001",
      checkIn: lastMonth,
      checkOut: lastMonthEnd,
      guestCount: 2,
      pricePerNight: "200.00",
      totalPrice: "400.00",
      status: BOOKING_STATUSES.COMPLETED,
      clientId: "seed-client-1",
      suiteId: suiteConfluenceId,
    },
  ]);

  console.log(
    "Seed terminé : 1 manager + 1 client + 3 établissements + 4 suites + 2 bookings",
  );

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

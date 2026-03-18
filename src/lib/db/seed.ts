import { db } from "@/lib/db";
import { user, establishment, suite } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  // Clean seed data for idempotence (order respects FK constraints)
  await db.delete(suite);
  await db.delete(establishment);
  await db.delete(user).where(eq(user.id, "seed-manager-1"));

  await db.insert(user).values({
    id: "seed-manager-1",
    name: "Gérant Test",
    email: "gerant@clairdelune.test",
    emailVerified: true,
    role: "manager",
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

  await db
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
    ]);

  console.log("Seed terminé : 1 manager + 3 établissements + 4 suites");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

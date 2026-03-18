import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";

async function seed() {
  const [manager] = await db
    .insert(user)
    .values({
      id: "seed-manager-1",
      name: "Gérant Test",
      email: "gerant@clairdelune.test",
      emailVerified: true,
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const managerId = manager?.id ?? "seed-manager-1";

  await db
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
    .onConflictDoNothing();

  console.log("Seed terminé : 1 manager + 3 établissements");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

import { db } from "@/lib/db";

export async function getAvailableSuites(_dateArrivee: Date, _dateDepart: Date) {
  // TODO: add bookings + suites tables to schema
  return db.select().from({} as never);
}

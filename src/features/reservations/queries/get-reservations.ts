import { db } from "@/lib/db";

export async function getReservations(_userId: string) {
  // TODO: add reservations table to schema
  return db.select().from({} as never);
}

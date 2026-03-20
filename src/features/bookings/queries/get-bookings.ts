import { db } from "@/lib/db";

export async function getBookings(_userId: string) {
  // TODO: add bookings table to schema
  return db.select().from({} as never);
}

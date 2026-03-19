"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReservation(_data: unknown) {
  // TODO: add reservations table to schema
  await db.insert({} as never).values(_data as never);
  revalidatePath("/bookings");
}

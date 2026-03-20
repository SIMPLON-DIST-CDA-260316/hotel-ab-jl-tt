"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBooking(_data: unknown) {
  // TODO: add bookings table to schema
  await db.insert({} as never).values(_data as never);
  revalidatePath("/bookings");
}

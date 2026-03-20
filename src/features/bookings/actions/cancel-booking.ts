"use server";

import { revalidatePath } from "next/cache";

export async function cancelBooking(_id: string) {
  // TODO: add bookings table to schema
  revalidatePath("/bookings");
}

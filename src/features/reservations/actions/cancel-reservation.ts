"use server";

import { revalidatePath } from "next/cache";

export async function cancelReservation(_id: string) {
  // TODO: add reservations table to schema
  revalidatePath("/reservations");
}

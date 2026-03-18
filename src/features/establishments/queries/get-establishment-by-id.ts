import { db } from "@/lib/db";

export async function getEstablishmentById(_id: string) {
  // TODO: add establishments table to schema
  return db.select().from({} as never);
}

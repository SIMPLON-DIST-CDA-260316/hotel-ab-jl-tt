import { db } from "@/lib/db";

export async function getEtablissements() {
  // TODO: add etablissements table to schema
  return db.select().from({} as never);
}

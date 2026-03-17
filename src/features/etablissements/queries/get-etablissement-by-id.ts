import { db } from "@/lib/db";

export async function getEtablissementById(_id: string) {
  // TODO: add etablissements table to schema
  return db.select().from({} as never);
}

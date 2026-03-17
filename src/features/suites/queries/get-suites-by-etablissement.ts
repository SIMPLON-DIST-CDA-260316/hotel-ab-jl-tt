import { db } from "@/lib/db";

export async function getSuitesByEtablissement(_etablissementId: string) {
  // TODO: add suites table to schema
  return db.select().from({} as never);
}

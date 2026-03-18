import { db } from "@/lib/db";

export async function getSuitesByEstablishment(_establishmentId: string) {
  // TODO: add suites table to schema
  return db.select().from({} as never);
}

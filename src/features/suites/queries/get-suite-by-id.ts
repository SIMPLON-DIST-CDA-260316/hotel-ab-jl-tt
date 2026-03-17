import { db } from "@/lib/db";

export async function getSuiteById(_id: string) {
  // TODO: add suites table to schema
  return db.select().from({} as never);
}

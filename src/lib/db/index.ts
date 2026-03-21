import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as domainSchema from "./schema/domain";
import * as relationsSchema from "./schema/relations";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...authSchema, ...domainSchema, ...relationsSchema },
});

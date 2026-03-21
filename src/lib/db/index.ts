/**
 * Database client — single Drizzle instance shared across the application.
 *
 * Schema is assembled from three focused files (auth / domain / relations)
 * via namespace spread. No barrel file: this aggregation point is the only
 * place that combines all three, keeping individual schema files importable
 * directly without circular dependencies.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as domainSchema from "./schema/domain";
import * as relationsSchema from "./schema/relations";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...authSchema, ...domainSchema, ...relationsSchema },
});

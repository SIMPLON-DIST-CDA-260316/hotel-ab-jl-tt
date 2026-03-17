import { getTableColumns } from "drizzle-orm";
import type { ColumnInfo } from "../types/db-viewer.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractColumns(table: any): ColumnInfo[] {
  const cols = getTableColumns(table);
  return Object.entries(cols).map(([key, col]) => ({
    name: key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbName: (col as any).name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataType: (col as any).dataType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notNull: (col as any).notNull,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasDefault: (col as any).hasDefault,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    primaryKey: (col as any).primary ?? false,
  }));
}

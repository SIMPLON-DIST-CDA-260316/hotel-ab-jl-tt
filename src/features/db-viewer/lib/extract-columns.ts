import { getTableColumns } from "drizzle-orm";
import type { ColumnInfo } from "../types/db-viewer.types";

 
export function extractColumns(table: any): ColumnInfo[] {
  const cols = getTableColumns(table);
  return Object.entries(cols).map(([key, col]) => ({
    name: key,
     
    dbName: (col as any).name,
     
    dataType: (col as any).dataType,
     
    notNull: (col as any).notNull,
     
    hasDefault: (col as any).hasDefault,
     
    primaryKey: (col as any).primary ?? false,
  }));
}

import { type Column, getTableColumns } from "drizzle-orm";
import type { Table } from "drizzle-orm";
import type { ColumnInfo } from "../types/db-viewer.types";

export function extractColumns(table: Table): ColumnInfo[] {
  const tableColumns = getTableColumns(table);
  return Object.entries(tableColumns).map(([key, column]) => ({
    name: key,
    dbName: (column as Column).name,
    dataType: (column as Column).dataType,
    notNull: (column as Column).notNull,
    hasDefault: (column as Column).hasDefault,
    primaryKey: (column as Column & { primary?: boolean }).primary ?? false,
  }));
}

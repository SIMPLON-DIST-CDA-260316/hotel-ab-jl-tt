import type { ColumnInfo } from "../types/db-viewer.types";
import { TypeBadge } from "./TypeBadge";

type SchemaTableProps = {
  columns: ColumnInfo[];
};

export function SchemaTable({ columns }: SchemaTableProps) {
  return (
    <table className="min-w-full border border-gray-200 text-sm mb-2">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-3 py-1.5 text-left border-b border-gray-200 text-gray-700">
            Colonne
          </th>
          <th className="px-3 py-1.5 text-left border-b border-gray-200 text-gray-700">
            DB name
          </th>
          <th className="px-3 py-1.5 text-left border-b border-gray-200 text-gray-700">
            Type
          </th>
          <th className="px-3 py-1.5 text-left border-b border-gray-200 text-gray-700">
            Contraintes
          </th>
        </tr>
      </thead>
      <tbody>
        {columns.map((column) => (
          <tr key={column.name} className="even:bg-gray-50">
            <td className="px-3 py-1.5 border-b border-gray-200 font-mono text-gray-900">
              {column.name}
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200 font-mono text-gray-500">
              {column.dbName}
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200">
              <TypeBadge type={column.dataType} />
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200 space-x-1">
              {column.primaryKey && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                  PK
                </span>
              )}
              {column.notNull && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                  NOT NULL
                </span>
              )}
              {column.hasDefault && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                  DEFAULT
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

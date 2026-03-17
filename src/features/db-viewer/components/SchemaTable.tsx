import type { ColumnInfo } from "../types/db-viewer.types";
import { TypeBadge } from "./TypeBadge";

export function SchemaTable({ columns }: { columns: ColumnInfo[] }) {
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
        {columns.map((col) => (
          <tr key={col.name} className="even:bg-gray-50">
            <td className="px-3 py-1.5 border-b border-gray-200 font-mono text-gray-900">
              {col.name}
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200 font-mono text-gray-500">
              {col.dbName}
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200">
              <TypeBadge type={col.dataType} />
            </td>
            <td className="px-3 py-1.5 border-b border-gray-200 space-x-1">
              {col.primaryKey && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                  PK
                </span>
              )}
              {col.notNull && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                  NOT NULL
                </span>
              )}
              {col.hasDefault && (
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

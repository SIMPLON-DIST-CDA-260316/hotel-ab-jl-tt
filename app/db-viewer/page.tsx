import { db } from "@/lib/db";
import { getTableColumns } from "drizzle-orm";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type ColumnInfo = {
  name: string;
  dbName: string;
  dataType: string;
  notNull: boolean;
  hasDefault: boolean;
  primaryKey: boolean;
};

type TableDef = {
  title: string;
  table: any;
};

const tables: TableDef[] = [
  { title: "user", table: schema.user },
  { title: "session", table: schema.session },
  { title: "account", table: schema.account },
  { title: "verification", table: schema.verification },
];

function extractColumns(table: TableDef["table"]): ColumnInfo[] {
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

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    string: "bg-blue-100 text-blue-800",
    boolean: "bg-purple-100 text-purple-800",
    date: "bg-amber-100 text-amber-800",
    number: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-mono ${colors[type] ?? "bg-gray-100 text-gray-700"}`}
    >
      {type}
    </span>
  );
}

function SchemaTable({ columns }: { columns: ColumnInfo[] }) {
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

function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) {
    return <p className="text-gray-500 italic text-sm">Aucune donnée</p>;
  }

  const columns = Object.keys(rows[0]);

  return (
    <table className="min-w-full border border-gray-200 text-sm">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th
              key={col}
              className="px-3 py-1.5 text-left border-b border-gray-200 font-mono text-gray-700"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="even:bg-gray-50">
            {columns.map((col) => (
              <td
                key={col}
                className="px-3 py-1.5 border-b border-gray-200 max-w-xs truncate text-gray-900"
              >
                {row[col] instanceof Date
                  ? row[col].toISOString()
                  : String(row[col] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function DbViewerPage() {
  const results = await Promise.all(
    tables.map(async (t) => ({
      title: t.title,
      columns: extractColumns(t.table),
      rows: (await db.select().from(t.table)) as Record<string, unknown>[],
    })),
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">DB Viewer</h1>
      {results.map((t) => (
        <section key={t.title} className="mb-10 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">
            {t.title}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {t.columns.length} colonnes &middot; {t.rows.length} lignes
            </span>
          </h2>
          <details className="mb-3">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Structure de la table
            </summary>
            <div className="mt-2">
              <SchemaTable columns={t.columns} />
            </div>
          </details>
          <DataTable rows={t.rows} />
        </section>
      ))}
    </main>
  );
}

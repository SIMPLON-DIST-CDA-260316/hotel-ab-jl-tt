import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";
import { extractColumns } from "@/features/db-viewer/lib/extract-columns";
import { SchemaTable } from "@/features/db-viewer/components/SchemaTable";
import { DataTable } from "@/features/db-viewer/components/DataTable";

export const dynamic = "force-dynamic";

const tables = [
  { title: "user", table: schema.user },
  { title: "session", table: schema.session },
  { title: "account", table: schema.account },
  { title: "verification", table: schema.verification },
];

export default async function DbViewerPage() {
  const tableViews = await Promise.all(
    tables.map(async (tableEntry) => ({
      title: tableEntry.title,
      columns: extractColumns(tableEntry.table),
      rows: (await db.select().from(tableEntry.table)) as Record<string, unknown>[],
    })),
  );

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">DB Viewer</h1>
      {tableViews.map((tableView) => (
        <section key={tableView.title} className="mb-10 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3">
            {tableView.title}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {tableView.columns.length} colonnes &middot; {tableView.rows.length} lignes
            </span>
          </h2>
          <details className="mb-3">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Structure de la table
            </summary>
            <div className="mt-2">
              <SchemaTable columns={tableView.columns} />
            </div>
          </details>
          <DataTable rows={tableView.rows} />
        </section>
      ))}
    </main>
  );
}

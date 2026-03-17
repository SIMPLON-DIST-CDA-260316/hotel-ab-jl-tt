import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getTableData() {
  const [users, sessions, accounts, verifications] = await Promise.all([
    db.select().from(user),
    db.select().from(session),
    db.select().from(account),
    db.select().from(verification),
  ]);
  return { users, sessions, accounts, verifications };
}

function Table({
  title,
  rows,
}: {
  title: string;
  rows: Record<string, unknown>[];
}) {
  if (rows.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-500 italic">Aucune donnée</p>
      </section>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <section className="mb-8 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-2">
        {title}{" "}
        <span className="text-sm font-normal text-gray-500">
          ({rows.length})
        </span>
      </h2>
      <table className="min-w-full border border-gray-700 text-sm">
        <thead>
          <tr className="bg-gray-800">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left border-b border-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-900">
              {columns.map((col) => (
                <td key={col} className="px-3 py-1.5 border-b border-gray-800 max-w-xs truncate">
                  {row[col] instanceof Date
                    ? row[col].toISOString()
                    : String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function DbViewerPage() {
  const data = await getTableData();

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">DB Viewer</h1>
      <Table title="Users" rows={data.users} />
      <Table title="Sessions" rows={data.sessions} />
      <Table title="Accounts" rows={data.accounts} />
      <Table title="Verifications" rows={data.verifications} />
    </main>
  );
}

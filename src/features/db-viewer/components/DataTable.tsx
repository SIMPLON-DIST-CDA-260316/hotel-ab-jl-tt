export function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
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

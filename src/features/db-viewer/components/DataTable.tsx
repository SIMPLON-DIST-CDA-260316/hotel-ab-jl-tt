type DataTableProps = {
  rows: Record<string, unknown>[];
};

export function DataTable({ rows }: DataTableProps) {
  if (rows.length === 0) {
    return <p className="text-gray-500 italic text-sm">Aucune donnée</p>;
  }

  const columns = Object.keys(rows[0]);

  return (
    <table className="min-w-full border border-gray-200 text-sm">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((column) => (
            <th
              key={column}
              className="px-3 py-1.5 text-left border-b border-gray-200 font-mono text-gray-700"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="even:bg-gray-50">
            {columns.map((column) => (
              <td
                key={column}
                className="px-3 py-1.5 border-b border-gray-200 max-w-xs truncate text-gray-900"
              >
                {row[column] instanceof Date
                  ? row[column].toISOString()
                  : String(row[column] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

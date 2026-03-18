const colors: Record<string, string> = {
  string: "bg-blue-100 text-blue-800",
  boolean: "bg-purple-100 text-purple-800",
  date: "bg-amber-100 text-amber-800",
  number: "bg-green-100 text-green-800",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-mono ${colors[type] ?? "bg-gray-100 text-gray-700"}`}
    >
      {type}
    </span>
  );
}

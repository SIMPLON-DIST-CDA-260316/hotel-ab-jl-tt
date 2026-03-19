const TYPE_COLORS: Record<string, string> = {
  string: "bg-blue-100 text-blue-800",
  boolean: "bg-purple-100 text-purple-800",
  date: "bg-amber-100 text-amber-800",
  number: "bg-green-100 text-green-800",
};

type TypeBadgeProps = {
  type: string;
};

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-mono ${TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700"}`}
    >
      {type}
    </span>
  );
}

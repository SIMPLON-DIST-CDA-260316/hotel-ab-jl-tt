type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{children}</span>
    </div>
  );
}

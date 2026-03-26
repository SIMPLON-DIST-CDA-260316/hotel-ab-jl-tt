type SectionHeaderProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function SectionHeader({ icon, children }: SectionHeaderProps) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {children}
    </h2>
  );
}

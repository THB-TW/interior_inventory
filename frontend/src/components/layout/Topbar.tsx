interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-[var(--color-border)] sticky top-0 z-30">
      <div>
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

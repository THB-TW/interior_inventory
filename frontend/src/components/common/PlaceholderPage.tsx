// 各未完成頁面的通用佔位 Placeholder
interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">{title}</h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        {description ?? '此功能尚在開發中，敬請期待。'}
      </p>
    </div>
  );
}

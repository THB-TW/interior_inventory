import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TrendingUp, Wallet, FileSearch } from 'lucide-react';

const financeNavItems = [
  { to: '/finance/profit', label: '案件損益', icon: TrendingUp },
  { to: '/finance/salary', label: '師傅薪資', icon: Wallet },
  { to: '/finance/invoices', label: '建材商對帳', icon: FileSearch },
];

export default function FinanceLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* ── 手機版：頂部 Tab Bar（md 以下顯示）── */}
      <nav className="md:hidden flex bg-white border-b border-[var(--color-border)] overflow-x-auto sticky top-0 z-20">
        {financeNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* ── 桌面版：左側次級 Sidebar（md 以上顯示）── */}
        <aside className="hidden md:flex flex-col w-48 bg-white border-r border-[var(--color-border)] shrink-0">
          <div className="px-4 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              財務管理
            </h2>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Finance
            </p>
          </div>

          <nav className="flex-1 py-3 px-2">
            <ul className="space-y-0.5">
              {financeNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
                      )
                    }
                  >
                    <item.icon size={15} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ── 主內容區域 ── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

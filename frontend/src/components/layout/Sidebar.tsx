import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  FileText,
  DollarSign,
  HardHat,
  Users,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/projects', label: '案件總覽', icon: FolderKanban },
  { to: '/inventory', label: '庫存管理', icon: Package },
  { to: '/quotes', label: '報價管理', icon: FileText },
  { to: '/finance', label: '財務管理', icon: DollarSign },
  { to: '/workers', label: '師傅管理', icon: HardHat },
  { to: '/clients', label: '客戶資料', icon: Users },
  { to: '/settings', label: '設定', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-[var(--color-border)] flex flex-col z-40">
      {/* Logo 區 */}
      <div className="h-14 flex items-center px-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <HardHat size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
              裝潢管理系統
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">
              Interior Manager
            </p>
          </div>
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
                  )
                }
              >
                <item.icon size={16} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部版本資訊 */}
      <div className="px-5 py-3 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-text-muted)]">v0.1.0 · 內部使用</p>
      </div>
    </aside>
  );
}

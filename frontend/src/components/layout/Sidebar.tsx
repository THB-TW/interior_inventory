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
  X,
} from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/projects',  label: '案件總覽',   icon: FolderKanban },
  { to: '/inventory', label: '庫存管理',   icon: Package },
  { to: '/quotes',    label: '報價管理',   icon: FileText },
  { to: '/finance',   label: '財務管理',   icon: DollarSign },
  { to: '/workers',   label: '師傅管理',   icon: HardHat },
  { to: '/clients',   label: '客戶資料',   icon: Users },
  { to: '/settings',  label: '設定',       icon: Settings },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-white border-r border-[var(--color-border)] flex flex-col z-50',
          'transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo + 關閉按鈕 */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--color-border)]">
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 導航選單 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]',
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

        {/* 底部版本 */}
        <div className="px-5 py-3 border-t border-[var(--color-border)]">
          <p className="text-[11px] text-[var(--color-text-muted)]">v0.1.0 · 內部使用</p>
        </div>
      </aside>
    </>
  );
}

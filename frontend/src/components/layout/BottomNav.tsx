import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 手機底部導覽列只放最常用的幾個
const mobileNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/projects', label: '案件', icon: FolderKanban },
  { to: '/inventory', label: '庫存', icon: Package },
  { to: '/quotes', label: '報價', icon: FileText },
];

/**
 * 手機版底部導覽列
 * 只在 md 以下螢幕顯示（md: = 768px）
 */
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] flex md:hidden">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] transition-colors',
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

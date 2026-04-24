import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Menu, HardHat } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">

      {/* ── 頂部導覽列（漢堡 + Logo） ── */}
      <header className="h-12 flex items-center gap-3 px-4 bg-white border-b border-[var(--color-border)] sticky top-0 z-30 shrink-0">
        <button
          id="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="開啟選單"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <HardHat size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            裝潢管理系統
          </span>
        </div>
      </header>

      {/* ── 漢堡選單 Drawer ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── 主內容（手機版底部留給 BottomNav） ── */}
      <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* ── 手機版底部導覽列 ── */}
      <BottomNav />
    </div>
  );
}

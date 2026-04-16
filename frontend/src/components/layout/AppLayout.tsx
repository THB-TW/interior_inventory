import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* 桌面版：固定左側 Sidebar（md 以上才顯示） */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 主內容區域：
          - 桌面版：ml-60 避開 Sidebar
          - 手機版：ml-0 全寬，底部多留 pb-16 給底部導覽列 */}
      <main className="flex-1 md:ml-60 min-h-screen flex flex-col pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* 手機版底部導覽列（md 以下才顯示） */}
      <BottomNav />
    </div>
  );
}

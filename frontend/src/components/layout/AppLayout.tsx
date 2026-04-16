import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// 主要版面配置：左側 Sidebar（固定240px）+ 右側主內容區域
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      {/* 主內容區域：左邊留出 sidebar 寬度 */}
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        {/* 各頁面透過 <Outlet /> 渲染，Topbar 在各頁面內使用以客製化標題 */}
        <Outlet />
      </main>
    </div>
  );
}

import Topbar from '@/components/layout/Topbar';
import PlaceholderPage from '@/components/common/PlaceholderPage';

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="系統總覽" />
      <div className="p-6">
        <PlaceholderPage title="Dashboard" description="系統總覽儀表板，開發中。" />
      </div>
    </>
  );
}

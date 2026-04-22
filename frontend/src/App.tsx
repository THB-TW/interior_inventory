import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProjectListPage from '@/pages/projects/ProjectListPage';
import ProjectEstimationPage from '@/pages/projects/ProjectEstimationPage';
import InventoryPage from '@/pages/inventory/InventoryPage';
import QuoteOverviewPage from '@/pages/quotes/QuoteOverviewPage';
import WorkerOverviewPage from '@/pages/workers/WorkerOverviewPage';
import PlaceholderPage from '@/components/common/PlaceholderPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/:id/estimate', element: <ProjectEstimationPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'quotes', element: <QuoteOverviewPage /> },
      { path: 'finance', element: <PlaceholderPage title="財務管理" /> },
      { path: 'workers', element: <WorkerOverviewPage /> },
      { path: 'clients', element: <PlaceholderPage title="客戶資料" /> },
      { path: 'settings', element: <PlaceholderPage title="設定" /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

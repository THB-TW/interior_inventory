import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProjectListPage from '@/pages/projects/ProjectListPage';
import PlaceholderPage from '@/components/common/PlaceholderPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'inventory', element: <PlaceholderPage title="庫存管理" /> },
      { path: 'quotes', element: <PlaceholderPage title="報價管理" /> },
      { path: 'finance', element: <PlaceholderPage title="財務管理" /> },
      { path: 'workers', element: <PlaceholderPage title="師傅管理" /> },
      { path: 'clients', element: <PlaceholderPage title="客戶資料" /> },
      { path: 'settings', element: <PlaceholderPage title="設定" /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

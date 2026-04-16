import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// React Query 全域設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // 失敗時只重試 1 次
      staleTime: 30_000,     // 30 秒內資料不重新 fetch
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

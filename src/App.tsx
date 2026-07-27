import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Logs } from './pages/Logs';
import { Rules } from './pages/Rules';
import { Devices } from './pages/Devices';
import { Threats } from './pages/Threats';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="/logs" element={<ErrorBoundary><Logs /></ErrorBoundary>} />
                <Route path="/rules" element={<ErrorBoundary><Rules /></ErrorBoundary>} />
                <Route path="/devices" element={<ErrorBoundary><Devices /></ErrorBoundary>} />
                <Route path="/threats" element={<ErrorBoundary><Threats /></ErrorBoundary>} />
              </Routes>
            </ErrorBoundary>
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

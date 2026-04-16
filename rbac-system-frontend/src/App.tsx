import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(240 8% 12%)',
            border: '1px solid hsl(240 10% 22%)',
            color: 'hsl(240 5% 96%)',
            fontFamily: 'Inter, sans-serif',
          },
          className: 'custom-toast',
        }}
        richColors
      />
    </QueryClientProvider>
  );
}

export default App;

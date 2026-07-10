import React from 'react';
import { BrowserRouter } from 'react-dom/client';
import { AppRouter } from './Router';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRouter />
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

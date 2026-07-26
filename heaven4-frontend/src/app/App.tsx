import { AppRouter } from './Router';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/core/auth/AuthProvider';
import { AudioProvider } from '@/core/contexts/AudioProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
      <GoogleOAuthProvider clientId="1234567890-mockclientid.apps.googleusercontent.com">
        <ThemeProvider defaultTheme="light" storageKey="heaven4-theme">
          <AuthProvider>
            <AudioProvider>
              <AppRouter />
              <Toaster position="top-right" />
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

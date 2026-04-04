import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';
import AppRoutes from '@/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              {/*
               * CookieConsentProvider must be inside BrowserRouter
               * (CookiePolicyPage uses <Link>) but outside AppRoutes
               * so the banner and modal are available on every route
               * including the /cookies page itself.
               */}
              <CookieConsentProvider>
                <AppRoutes />
              </CookieConsentProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AdminRoute from '@/routes/AdminRoute';

// Public pages
import HomePage from '@/pages/public/HomePage';
import CatalogPage from '@/pages/public/CatalogPage';
import ProductDetailPage from '@/pages/public/ProductDetailPage';
import CartPage from '@/pages/public/CartPage';
import CheckoutPage from '@/pages/public/CheckoutPage';
import PaystackCallbackPage from '@/pages/public/PaystackCallbackPage';
import OrderConfirmationPage from '@/pages/public/OrderConfirmationPage';
import GuestOrderLookupPage from '@/pages/public/GuestOrderLookupPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Account pages
import AccountPage from '@/pages/account/AccountPage';
import OrderHistoryPage from '@/pages/account/OrderHistoryPage';
import OrderDetailPage from '@/pages/account/OrderDetailPage';
import ChangePasswordPage from '@/pages/account/ChangePasswordPage';

// Admin pages
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductListPage from '@/pages/admin/ProductListPage';
import OrderListPage from '@/pages/admin/OrderListPage';
import AdminOrderDetailPage from '@/pages/admin/OrderDetailPage';
import UnshippedOrdersPage from '@/pages/admin/UnshippedOrdersPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public layout routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/guest-order" element={<GuestOrderLookupPage />} />

          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected customer routes */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/checkout/paystack/callback" element={<PaystackCallbackPage />} />
          <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

          {/* Account routes */}
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/account/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin layout routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="unshipped" element={<UnshippedOrdersPage />} />
        </Route>
      </Routes>
    </>
  );
}

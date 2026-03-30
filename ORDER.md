INFLEXA FRONTEND IMPLEMENTATION ORDER
======================================

This document defines the exact order in which every frontend
file must be implemented. Each phase builds on the previous one.
No file should be created out of sequence.


================================================================
PHASE 1: PROJECT SCAFFOLD & CONFIGURATION
================================================================
These files establish the build system, TypeScript config,
environment variables, and entry points. Nothing else can
exist without these.

  1.  package.json
  2.  vite.config.ts
  3.  tsconfig.json
  4.  tsconfig.node.json
  5.  .env.example
  6.  .gitignore
  7.  index.html


================================================================
PHASE 2: TYPES & CONSTANTS
================================================================
Pure TypeScript types and constants with zero imports from
the project. Every other file depends on these.

  8.  src/vite-env.d.ts
  9.  src/types/api.types.ts
  10. src/types/auth.types.ts
  11. src/types/product.types.ts
  12. src/types/order.types.ts
  13. src/types/payment.types.ts
  14. src/utils/constants.ts


================================================================
PHASE 3: UTILITIES
================================================================
Pure functions with no React dependencies. Used by API layer,
contexts, and components.

  15. src/utils/currency.ts
  16. src/utils/storage.ts
  17. src/utils/validators.ts


================================================================
PHASE 4: GLOBAL STYLES
================================================================
CSS reset, variables, and base typography. Must exist before
any component renders.

  18. src/styles/globals.css


================================================================
PHASE 5: API CLIENT LAYER
================================================================
Axios instance first, then each domain API file. These depend
only on types, constants, and storage (all already built).

  19. src/api/client.ts
  20. src/api/auth.api.ts
  21. src/api/user.api.ts
  22. src/api/products.api.ts
  23. src/api/orders.api.ts
  24. src/api/payments.api.ts
  25. src/api/admin/products.api.ts
  26. src/api/admin/orders.api.ts


================================================================
PHASE 6: CONTEXTS
================================================================
React Context providers. These depend on API layer and types.
ToastContext is standalone. AuthContext uses auth.api and
storage. CartContext uses storage.

  27. src/contexts/ToastContext.tsx
  28. src/contexts/AuthContext.tsx
  29. src/contexts/CartContext.tsx


================================================================
PHASE 7: HOOKS
================================================================
Custom hooks that consume contexts or API functions.
Context shortcut hooks first, then data-fetching hooks.

  30. src/hooks/useToast.ts
  31. src/hooks/useAuth.ts
  32. src/hooks/useCart.ts
  33. src/hooks/useDebounce.ts
  34. src/hooks/useProducts.ts
  35. src/hooks/useProduct.ts
  36. src/hooks/useOrders.ts


================================================================
PHASE 8: COMMON UI COMPONENTS
================================================================
Atomic, reusable components with no business logic.
No dependencies on hooks, contexts, or API. Only types
and styles.

  37. src/components/common/Spinner.tsx
  38. src/components/common/Button.tsx
  39. src/components/common/Input.tsx
  40. src/components/common/Select.tsx
  41. src/components/common/Badge.tsx
  42. src/components/common/Modal.tsx
  43. src/components/common/Pagination.tsx
  44. src/components/common/EmptyState.tsx
  45. src/components/common/ErrorAlert.tsx
  46. src/components/common/Toast.tsx


================================================================
PHASE 9: LAYOUT COMPONENTS
================================================================
Page structure wrappers. Depend on common components,
AuthContext (for nav state), and CartContext (for cart icon).

  47. src/components/layout/Header.tsx
  48. src/components/layout/Footer.tsx
  49. src/components/layout/PublicLayout.tsx
  50. src/components/layout/AdminSidebar.tsx
  51. src/components/layout/AdminLayout.tsx


================================================================
PHASE 10: AUTH COMPONENTS
================================================================
Form components for authentication. Depend on common
components, auth hooks, and validators.

  52. src/components/auth/LoginForm.tsx
  53. src/components/auth/RegisterForm.tsx
  54. src/components/auth/ForgotPasswordForm.tsx
  55. src/components/auth/ResetPasswordForm.tsx


================================================================
PHASE 11: PRODUCT COMPONENTS
================================================================
Product display components. Depend on common components,
types, and currency util.

  56. src/components/product/ProductImage.tsx
  57. src/components/product/ProductCard.tsx
  58. src/components/product/ProductGrid.tsx
  59. src/components/product/ProductFilters.tsx
  60. src/components/product/ProductInfo.tsx


================================================================
PHASE 12: CART COMPONENTS
================================================================
Cart UI pieces. Depend on common components, CartContext,
and currency util.

  61. src/components/cart/CartItem.tsx
  62. src/components/cart/CartSummary.tsx
  63. src/components/cart/CartDrawer.tsx


================================================================
PHASE 13: CHECKOUT COMPONENTS
================================================================
Checkout form pieces. Depend on common components,
validators, and Stripe Elements.

  64. src/components/checkout/ShippingForm.tsx
  65. src/components/checkout/OrderReview.tsx
  66. src/components/checkout/StripePaymentForm.tsx


================================================================
PHASE 14: ORDER COMPONENTS
================================================================
Order display pieces. Depend on common components,
types, and currency util.

  67. src/components/order/OrderStatusBadge.tsx
  68. src/components/order/OrderItemRow.tsx
  69. src/components/order/OrderTimeline.tsx
  70. src/components/order/OrderCard.tsx


================================================================
PHASE 15: ROUTE GUARDS
================================================================
Protected route wrappers. Depend on AuthContext.
Must exist before any page is wired into the router.

  71. src/routes/ProtectedRoute.tsx
  72. src/routes/AdminRoute.tsx


================================================================
PHASE 16: PUBLIC PAGES
================================================================
Customer-facing pages. Depend on all components, hooks,
and contexts built above.

  73. src/pages/public/HomePage.tsx
  74. src/pages/public/CatalogPage.tsx
  75. src/pages/public/ProductDetailPage.tsx
  76. src/pages/public/CartPage.tsx
  77. src/pages/public/CheckoutPage.tsx
  78. src/pages/public/OrderConfirmationPage.tsx
  79. src/pages/public/GuestOrderLookupPage.tsx
  80. src/pages/public/NotFoundPage.tsx


================================================================
PHASE 17: AUTH PAGES
================================================================
Authentication pages. Depend on auth form components.

  81. src/pages/auth/LoginPage.tsx
  82. src/pages/auth/RegisterPage.tsx
  83. src/pages/auth/ForgotPasswordPage.tsx
  84. src/pages/auth/ResetPasswordPage.tsx


================================================================
PHASE 18: ACCOUNT PAGES
================================================================
Authenticated user pages. Depend on order components,
hooks, and ProtectedRoute.

  85. src/pages/account/AccountPage.tsx
  86. src/pages/account/OrderHistoryPage.tsx
  87. src/pages/account/OrderDetailPage.tsx
  88. src/pages/account/ChangePasswordPage.tsx


================================================================
PHASE 19: ADMIN PAGES
================================================================
Admin panel pages. Depend on admin API, all components,
and AdminRoute guard.

  89. src/pages/admin/DashboardPage.tsx
  90. src/pages/admin/ProductListPage.tsx
  91. src/pages/admin/ProductFormPage.tsx
  92. src/pages/admin/OrderListPage.tsx
  93. src/pages/admin/OrderDetailPage.tsx
  94. src/pages/admin/UnshippedOrdersPage.tsx


================================================================
PHASE 20: ROUTER & APP ENTRY
================================================================
These are the final files. The router imports every page.
App.tsx wraps everything in providers. main.tsx mounts
the app to the DOM.

  95. src/routes/AppRoutes.tsx
  96. src/App.tsx
  97. src/main.tsx


================================================================
TOTAL: 97 files
================================================================

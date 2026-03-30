

### 4.4 Pages — Detailed Specification

---

#### PAGE: Landing (`/`)

**Purpose:** First impression. Convert visitors to browsers.

**Sections:**
1. Hero — headline, subheadline, "Shop Now" CTA button linking to `/store`
2. Features — 3 value proposition cards (Offline-first, Age-appropriate, Physical + Printable)
3. Featured Products — fetch 3–4 products from `GET /api/products`, display as ProductCards
4. Age Range Bands — visual links to `/store?ageRange=3-5` and `/store?ageRange=6-8`
5. Footer

**API used:** `GET /api/products?limit=4`

---

#### PAGE: Store / Catalogue (`/store`)

**Purpose:** Browse all products with filtering.

**Layout:** Filter sidebar (desktop) or filter sheet (mobile) + product grid

**Filter controls:**
- Age Range (checkbox or pill): 3–5, 6–8, all ages
- Subject (checkbox): Maths, English, Science, General Knowledge, etc.
- Format (toggle): Physical / Printable / Both
- Focus Area (checkbox): Memory, Reading, Numbers, etc.

**Behaviour:**
- Filters update the URL query string (`/store?subject=Maths&format=physical`)
- On load, read filters from URL and pre-apply them
- Filters sent as query params to `GET /api/products`
- Show product count ("Showing 12 results")
- Show empty state if no products match filters

**API used:** `GET /api/products?ageRange=&subject=&format=&focusArea=`

---

#### PAGE: Product Detail (`/product/:id`)

**Purpose:** Full product information + add to cart.

**Sections:**
- Product image (placeholder if none uploaded yet)
- Title, age range badge, subject badge, format badge
- Price (large, prominent)
- Description
- What's Included (list from `includedItems` field)
- Focus Area
- Quantity selector (1–10)
- "Add to Cart" button — dispatches `addToCart` to Redux
- Stock indicator (show "Low Stock" if `inventoryCount` < 5, "Out of Stock" if 0)
- Breadcrumb: Home > Store > [Product Title]

**API used:** `GET /api/products/:id`

---

#### PAGE: Cart (`/cart`)

**Purpose:** Review cart before checkout.

**Sections:**
- Cart item list — each item shows: image, title, price, quantity stepper (+/−), remove button, item subtotal
- Order summary panel — subtotal, shipping note ("calculated at checkout"), total
- "Continue Shopping" link to `/store`
- "Proceed to Checkout" button (redirects to `/login` if not authenticated)
- Empty cart state with illustration and link to store

**State:** All from Redux `cartSlice` — no API call on this page

---

#### PAGE: Checkout (`/checkout`)

**Purpose:** Collect shipping details + process payment.

**Requires:** User must be authenticated. Redirect to `/login?redirect=/checkout` if not.

**Sections:**
1. **Order Summary** — read-only list of cart items + total
2. **Shipping Details Form**
   - Full Name, Email, Phone
   - Address Line 1, Address Line 2 (optional)
   - City, State/Province, Postal Code
   - Country (select)
3. **Payment Section** — Stripe `<CardElement />` embedded
4. "Place Order" button

**Flow on submit:**
1. Validate shipping form
2. Call `POST /api/payments/create-intent` → get `clientSecret`
3. Call `stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })`
4. On Stripe success: call `POST /api/orders` to create order record
5. Dispatch `clearCart`
6. Navigate to `/order-confirmation` passing `orderId` in router state

**API used:**
- `POST /api/payments/create-intent`
- `POST /api/orders`

---

#### PAGE: Order Confirmation (`/order-confirmation`)

**Purpose:** Confirm the order was placed successfully.

**Sections:**
- Success icon / animation
- "Thank you, [Name]!" heading
- Order ID (from router state)
- Summary of what was ordered
- Estimated delivery note
- "Continue Shopping" button
- "View Your Orders" link to `/account`

**API used:** None (data passed via router state from Checkout)

---

#### PAGE: Login (`/login`)

**Purpose:** Authenticate existing users.

**Form fields:** Username, Password
**Submit:** Dispatch `loginThunk` → on success, redirect to original destination or `/store`
**Link:** "Don't have an account? Register"
**Error:** Show inline error for invalid credentials

**API used:** `POST /api/auth/login`

---

#### PAGE: Register (`/register`)

**Purpose:** Create a new account.

**Form fields:** Username, Email, Password, Confirm Password
**Validation:** Client-side password match check + min 8 chars
**Submit:** Dispatch `registerThunk` → on success, redirect to `/login` with success message
**Link:** "Already have an account? Log in"

**API used:** `POST /api/auth/register`

---

#### PAGE: User Account (`/account`)

**Purpose:** View profile and order history.

**Requires:** Authentication. Redirect to `/login` if not.

**Sections:**
1. Profile card — username, email, member since date
2. Order History table — Order ID, Date, Items (count), Total, Status badge, "View Details" link

**API used:**
- `GET /api/users/me`
- `GET /api/orders/:id` (per order in history)

---

#### PAGE: Admin — Overview (`/admin`)

**Purpose:** Dashboard landing for admins.

**Requires:** Authentication + role === 'admin'. Redirect all others to `/`.

**Sections:**
- Stats cards: Total Products, Total Orders, Pending Orders, Revenue (sum of Paid orders)
- Recent Orders table (last 5)
- Low Stock Alerts (products where `inventoryCount` < 5)

**API used:**
- `GET /api/admin/orders`
- `GET /api/admin/products`

---

#### PAGE: Admin — Products (`/admin/products`)

**Purpose:** Create, edit, delete flashcard packs. Manage inventory.

**Sections:**
- Product list table: Title, Format, Price, Stock, Actions (Edit / Delete)
- "Add New Product" button → opens `ProductForm` in a modal
- Click Edit → opens `ProductForm` pre-filled with product data
- Click Delete → confirmation modal → `DELETE /api/admin/products/:id`
- Inventory column: editable number field, save inline via `PATCH /api/admin/products/:id/inventory`

**ProductForm fields:**
- Title (text)
- Description (textarea)
- Age Range (select: 3–5, 6–8, All Ages)
- Subject (select or text)
- Focus Area (text)
- Price (number)
- Format (Physical / Printable radio)
- What's Included (dynamic list — add/remove items)
- Preview Image (file upload)
- Inventory Count (number)

**API used:**
- `GET /api/admin/products`
- `POST /api/admin/products` (create)
- `PUT /api/admin/products/:id` (update)
- `DELETE /api/admin/products/:id` (delete)
- `PATCH /api/admin/products/:id/inventory`

---

#### PAGE: Admin — Orders (`/admin/orders`)

**Purpose:** View all orders, update status, export data.

**Sections:**
- Filter bar: Status filter (All / Pending / Paid / Shipped / Delivered / Cancelled), Date range
- Orders table: Order ID, Customer, Items, Total, Status badge, Date, Actions
- Status update: dropdown select per row → `PUT /api/admin/orders/:id/status`
- "Export CSV" button → triggers `GET /api/admin/orders/export` → downloads file

**API used:**
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id/status`
- `GET /api/admin/orders/export`

---

#### PAGE: 404 Not Found (`*`)

Simple page with a message and a "Go Home" button.

---

### 4.5 Components — Detailed Specification

#### `Navbar.tsx`
- Brand logo/name (links to `/`)
- Navigation links: Home, Store, Cart (with item count badge from Redux)
- Auth-aware: show "Login / Register" when logged out; show username + "Logout" when logged in
- Admin link (visible only if `user.role === 'admin'`)
- Mobile: hamburger menu

#### `ProtectedRoute.tsx`
Wraps any route that requires authentication. If `!isAuthenticated`, redirects to `/login?redirect=<current path>`.

#### `AdminRoute.tsx`
Wraps admin routes. If not authenticated → `/login`. If authenticated but not admin → `/` (home, with a toast error).

#### `ProductCard.tsx`
- Product image (with fallback placeholder)
- Title, Age Range badge, Subject badge
- Price
- Format tag (Physical or Printable)
- "Add to Cart" button → dispatches `addToCart` to Redux
- Clicking the card → navigates to `/product/:id`

#### `ProductFilters.tsx`
- Controlled filter form (controlled by URL query params)
- Checkboxes for subject, focus area
- Radio/toggle for format
- Pills for age range
- "Clear All Filters" reset button

#### `StripePaymentForm.tsx`
- Wraps Stripe `<CardElement />` with custom styling matching brand
- Handles Stripe errors and displays them inline
- Shows a loading state while payment is confirming

#### `OrderTable.tsx` (Admin)
- Displays orders in a sortable table
- Status dropdown per row (Pending / Paid / Shipped / Delivered / Cancelled)
- Styled status badges (colour-coded)

#### `Spinner.tsx`
Reusable loading spinner used across all async operations.

#### `EmptyState.tsx`
Reusable empty state with customisable icon, heading, subtext, and optional CTA button.

#### `Modal.tsx`
Reusable modal with overlay. Used for ProductForm, delete confirmation, etc.

---

### 4.6 Routing Setup (`App.tsx`)

```
/                        → Landing
/store                   → Store
/product/:id             → ProductDetail
/cart                    → Cart
/checkout                → Checkout (ProtectedRoute)
/order-confirmation      → OrderConfirmation (ProtectedRoute)
/login                   → Login
/register                → Register
/account                 → UserAccount (ProtectedRoute)
/admin                   → AdminRoute → AdminLayout
  /admin/                → AdminOverview
  /admin/products        → AdminProducts
  /admin/orders          → AdminOrders
*                        → NotFound
```

---

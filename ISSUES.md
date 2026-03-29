# Inflexa — Backend Issues & Gaps
**Prepared by:** Emmanuel U. Iziogo
**Date:** March 29, 2026
**For:** Backend Engineer

---

## Project Decisions (Reference for All Work)

These are confirmed decisions that must be reflected throughout the backend:

- **Database:** PostgreSQL (pg driver — already installed and configured correctly)
- **Store name:** Inflexa
- **Currency:** Multi-currency. Primary currency is **GBP (£)** for UK market launch. The system must support storing and displaying prices in multiple currencies
- **Product images:** Stored in the database as a URL/link (no cloud storage for now). Add an `image_url` column to the products table
- **Email confirmation:** Included in MVP. Needs an email service (Nodemailer, Resend, or SendGrid) to send order confirmation emails after successful payment
- **Shipping:** EasyPost API for shipping label generation and tracking

---

## PART A — Bugs (Things That Are Broken)

---

### A1 · package.json

- `mongoose` is not listed but every model imports from it — remove all Mongoose usage (see A-CRITICAL below)
- `stripe` is not in dependencies — `paymentController.ts` will crash on load
- `express-validator` is not in dependencies — `validation.ts` imports from it, will crash on load
- `body-parser` is used in `server.ts` but not listed in dependencies
- `multer` is not installed — needed for image upload handling
- `helmet` is not installed — needed for HTTP security headers (PRD requirement)
- `express-rate-limit` is not installed — needed for rate limiting (PRD requirement)
- `nodemailer` or email SDK not installed — needed for order confirmation emails (MVP requirement)
- `@easypost/api` not installed — needed for EasyPost shipping integration (MVP requirement)

---

### A-CRITICAL · All Four Models Are Written in Mongoose (MongoDB) — Must Be Rewritten for PostgreSQL

This is the most critical issue in the codebase. The database driver (`pg`) is correctly set up for PostgreSQL, but all four model files (`User.ts`, `Product.ts`, `Order.ts`, `Payment.ts`) import from `mongoose` and define Mongoose schemas. Mongoose is a MongoDB ODM and is completely incompatible with PostgreSQL.

Every model must be discarded and rewritten as PostgreSQL table definitions using either raw `pg` queries or a PostgreSQL-compatible ORM such as **Prisma** or **TypeORM**. The choice must be decided and confirmed before any model work begins.

The rewritten models must include all the fields listed in A10–A13 below.

---

### A2 · config/database.ts

- The PostgreSQL pool is exported as `default` but `server.ts` imports it as `{ config }` — that named export does not exist, so `config.database` is `undefined`
- `server.ts` then calls `mongoose.connect(config.database)` — doubly wrong: the import is `undefined` AND Mongoose must not be used at all (see A-CRITICAL)
- **Fix:** Export a named `config` object with the pool, or restructure `server.ts` to initialise the pg pool directly and remove all Mongoose references

---

### A3 · server.ts

- `dotenv` is installed but never imported or called — every environment variable (`DB_USER`, `DB_HOST`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `EASYPOST_API_KEY`, etc.) is `undefined` at startup
- `import mongoose from 'mongoose'` and `mongoose.connect(...)` — must be completely removed and replaced with the pg pool connection
- `import { config } from './config/database'` — named export does not exist (see A2)
- `body-parser` is deprecated since Express 4.16 — replace with `app.use(express.json())`
- `cors()` with no options — any website can make requests to this API in production
- No `helmet` middleware
- No rate limiting
- No global error handling middleware — unhandled errors crash the process or hang requests
- No 404 handler for undefined routes

---

### A4 · middleware/auth.ts

- Exports `authMiddleware` and `adminMiddleware`
- `routes/orders.ts` imports `authenticate` — does not exist, route crashes on load
- `routes/admin.ts` imports `authenticateAdmin` — does not exist, route crashes on load
- `import { User } from '../models/User'` — `User.ts` uses `export default`, named import is `undefined`. Once models are rewritten for PostgreSQL this import must also be updated
- `req.user` is assigned but the Express `Request` type has no `user` property — TypeScript strict mode rejects this. A custom `express.d.ts` declaration file is required

---

### A5 · middleware/validation.ts

- `routes/auth.ts` imports `validateRegistration` — does not exist. Auth route crashes on load, register and login are completely unavailable
- `routes/auth.ts` imports `validateLogin` — does not exist. Same crash
- `validateProduct` does not validate `includedItems`, `inventoryCount`, or `imageUrl`
- `validateOrder` does not validate `totalAmount`, `shippingAddress`, or `currency`
- `validateOrder` checks `userId` from the body — `userId` must come from the verified JWT, never the request body

---

### A6 · controllers/authController.ts

- `register()` only destructures `{ username, password }` — `email` is never extracted or saved. Email is required in the User model so every registration fails
- `jwt.sign({ id: user._id }, ...)` — `_id` is a MongoDB field. PostgreSQL uses `id` (integer or UUID). Once models are rewritten, this must use the correct PG column
- `role` is never included in the JWT payload — `adminMiddleware` checks `req.user.role === 'admin'` and will always deny access
- `const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'` — dotenv is never loaded so this always falls back to the public plaintext string. Any token can be forged
- `login()` returns only `{ token }` — must return `{ token, user: { id, username, email, role } }`
- All DB calls use Mongoose methods — must be rewritten as pg queries

---

### A7 · controllers/productController.ts

- All DB calls use Mongoose — must be rewritten as pg queries
- `getAllProducts` calls `Product.find()` with no filters — query params (`ageRange`, `subject`, `focusArea`, `format`) are never read. The store cannot filter products
- `createProduct` passes raw `req.body` to the model with no validation applied
- `updateProduct` passes raw `req.body` with no validation
- No image handling — `image_url` field does not exist in the current model (see A11)

---

### A8 · controllers/orderController.ts

- All DB calls use Mongoose — must be rewritten as pg queries
- `createOrder` uses `req.body` directly — `userId` must always come from `req.user.id`, never from the body
- `createOrder` does not check inventory before accepting the order
- `createOrder` does not decrement `inventory_count` after accepting the order
- `createOrder` does not send an order confirmation email (MVP requirement)
- `createOrder` does not initiate EasyPost shipping (MVP requirement)
- `updateOrder` accepts any field in `req.body` — dangerous, should only accept `order_status`
- `getOrders` (all orders) is exported but never registered in any route file
- No joins on product/user data — raw foreign key IDs returned instead of meaningful data

---

### A9 · controllers/paymentController.ts

- `import { Payment } from '../models/Payment'` — named import of a default export, resolves to `undefined`. Every payment call crashes at runtime
- All DB calls use Mongoose — must be rewritten as pg queries
- `stripe.paymentIntents.create({ confirm: true })` — incorrect Stripe flow, throws a Stripe API error on every attempt. Correct flow: server creates intent → returns `clientSecret` → frontend confirms with Stripe.js
- `apiVersion: '2020-08-27'` is outdated
- `orderId` is never saved to the Payment record
- `currency` is not saved — and the Payment model has no currency field (see A13)
- `stripePaymentIntentId` is never saved — no way to link a local record to a Stripe event

---

### A10 · models/User.ts — Must Be Rewritten for PostgreSQL

Entire file uses Mongoose. Replace with a `users` table definition:

| Column | Type | Constraints |
|---|---|---|
| id | serial / UUID | primary key |
| username | varchar | unique, not null |
| email | varchar | unique, not null |
| password | varchar | not null |
| role | varchar | default 'user', values: 'user' or 'admin' |
| created_at | timestamptz | default now() |

---

### A11 · models/Product.ts — Must Be Rewritten for PostgreSQL

Entire file uses Mongoose. Replace with a `products` table definition:

| Column | Type | Constraints |
|---|---|---|
| id | serial / UUID | primary key |
| title | varchar | not null |
| description | text | not null |
| age_range | varchar | not null |
| subject | varchar | not null |
| focus_area | varchar | not null |
| price | numeric(10,2) | not null |
| currency | varchar(3) | not null, default 'GBP' |
| format | varchar | not null, values: 'physical' or 'printable' |
| included_items | text[] or jsonb | not null |
| inventory_count | integer | default 0 |
| image_url | varchar | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

---

### A12 · models/Order.ts — Must Be Rewritten for PostgreSQL

Entire file uses Mongoose. Also missing `shippingAddress`, `currency`, and price-per-item capture. Replace with two tables:

**orders table:**

| Column | Type | Constraints |
|---|---|---|
| id | serial / UUID | primary key |
| user_id | integer | foreign key → users(id) |
| total_amount | numeric(10,2) | not null |
| currency | varchar(3) | not null, default 'GBP' |
| order_status | varchar | default 'Pending' |
| shipping_name | varchar | not null |
| shipping_email | varchar | not null |
| shipping_phone | varchar | |
| shipping_address_line1 | varchar | not null |
| shipping_address_line2 | varchar | nullable |
| shipping_city | varchar | not null |
| shipping_state | varchar | not null |
| shipping_postal_code | varchar | not null |
| shipping_country | varchar | not null, default 'GB' |
| easypost_shipment_id | varchar | nullable |
| tracking_code | varchar | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**order_items table:**

| Column | Type | Constraints |
|---|---|---|
| id | serial | primary key |
| order_id | integer | foreign key → orders(id) |
| product_id | integer | foreign key → products(id) |
| quantity | integer | not null |
| unit_price | numeric(10,2) | not null (price at time of purchase) |
| currency | varchar(3) | not null |

---

### A13 · models/Payment.ts — Must Be Rewritten for PostgreSQL

Entire file uses Mongoose. Also missing `currency` and `stripe_payment_intent_id`. Replace with a `payments` table:

| Column | Type | Constraints |
|---|---|---|
| id | serial / UUID | primary key |
| order_id | integer | foreign key → orders(id), not null |
| stripe_payment_intent_id | varchar | unique, not null |
| amount | numeric(10,2) | not null |
| currency | varchar(3) | not null |
| payment_method | varchar | not null |
| status | varchar | values: 'pending', 'completed', 'failed' |
| created_at | timestamptz | default now() |

---

### A14 · routes/auth.ts

- Imports `validateRegistration` — does not exist. Route crashes on load
- Imports `validateLogin` — does not exist. Route crashes on load
- Result: `/api/auth/register` and `/api/auth/login` are completely unavailable

---

### A15 · routes/products.ts

- `POST /`, `PUT /:id`, `DELETE /:id` have no auth middleware — anyone can create, edit, or delete products
- `validateProduct` exists in `validation.ts` but is never applied to any route here

---

### A16 · routes/orders.ts

- Imports `authenticate` — does not exist (exported as `authMiddleware`). Import is `undefined`
- Imports `getOrder` — does not exist (exported as `getOrderById`). Import is `undefined`
- Imports `updateOrderStatus` — does not exist (exported as `updateOrder`). Import is `undefined`
- Entire orders route file fails at runtime

---

### A17 · routes/payments.ts

- `processPayment` route has no auth middleware — anyone can trigger a Stripe payment
- `getPaymentDetails` is exported from `paymentController.ts` but never registered as a route

---

### A18 · routes/admin.ts

- Imports `createFlashcardPack` — does not exist (should be `createProduct`)
- Imports `updateFlashcardPack` — does not exist (should be `updateProduct`)
- Imports `deleteFlashcardPack` — does not exist (should be `deleteProduct`)
- Imports `getFlashcardPacks` — does not exist (should be `getAllProducts`)
- Imports `getFlashcardPackById` — does not exist (should be `getProductById`)
- Imports `authenticateAdmin` — does not exist (should be `adminMiddleware`)
- `router.use(authenticateAdmin)` — even if fixed, `adminMiddleware` alone does not verify the JWT. `authMiddleware` must run before it
- Routes are at `/packs` — must be `/products`
- Entire admin route file is non-functional

---

### A19 · tsconfig.json

- `strict: true` causes `catch (error) { error.message }` to fail — TypeScript types catch variables as `unknown`. All controllers need `catch (error: any)` or proper type narrowing or the build will fail
- `strict: true` also rejects `req.user` assignment since `Request` has no `user` property — an `express.d.ts` type declaration file must be created

---

## PART B — Gaps (Features Required by PRD Not Yet Built)

---

### B1 · No Database Migrations

Since the app uses PostgreSQL, SQL migration files must be created that set up all tables with correct columns, types, constraints, and foreign keys. Nothing like this exists. Required tables: `users`, `products`, `orders`, `order_items`, `payments`.

---

### B2 · No Current User Endpoint

`GET /api/users/me` does not exist. The User Account page needs to load the logged-in user's profile. Needs a controller that reads `req.user.id` from the JWT and queries the users table, returning the user without the password.

---

### B3 · No Endpoint to List All Orders (Admin)

`getOrders` exists in `orderController.ts` but is never mounted in any route. The admin Orders dashboard has no data source. Needs `GET /api/admin/orders` with `authMiddleware` + `adminMiddleware`, joining `order_items` and `users` tables.

---

### B4 · No Admin Order Status Update Endpoint

No dedicated endpoint to update only order status. Needs `PUT /api/admin/orders/:id/status` that only updates `order_status` and validates against the allowed enum values.

---

### B5 · No Working Admin Product Routes

All 5 controller import names in `admin.ts` are wrong (see A18). Once fixed, routes must be at `/api/admin/products` with `authMiddleware` + `adminMiddleware` applied.

---

### B6 · Inventory Not Decremented on Order

When an order is created, `inventory_count` on the relevant products is never reduced. Must be handled inside a PostgreSQL transaction so that if any step fails, the whole order rolls back.

---

### B7 · No Out-of-Stock Guard

No check in `createOrder` that `inventory_count >= quantity` before accepting the order. Customers can order out-of-stock products.

---

### B8 · No Inventory Update Endpoint

`PATCH /api/admin/products/:id/inventory` does not exist. Admins have no way to update stock count independently.

---

### B9 · No Stripe Payment Intent Endpoint

`POST /api/payments/create-intent` does not exist. The current `/process` route uses an incorrect Stripe flow. The server must create a Payment Intent and return `clientSecret` to the frontend. The Payment Intent must include the `orderId` in its metadata so the webhook can link back to it.

---

### B10 · No Stripe Webhook Handler

`POST /api/payments/webhook` does not exist. Without it, Stripe cannot notify the server when a payment succeeds, so `order_status` never updates from `Pending` to `Paid`. This route must use `express.raw()` for Stripe signature verification using `STRIPE_WEBHOOK_SECRET`.

---

### B11 · No Order Confirmation Email

When an order is successfully paid (triggered by the Stripe webhook on `payment_intent.succeeded`), a confirmation email must be sent to the customer. Required:
- Email service installed and configured (Nodemailer, Resend, or SendGrid)
- Email template for Inflexa showing order ID, items purchased, total in GBP (with currency symbol), and shipping address
- Email send triggered inside the webhook handler

---

### B12 · No EasyPost Shipping Integration

After an order is paid, EasyPost must be called to create a shipment and purchase a shipping label:
- Create EasyPost shipment using the customer's shipping address from the order
- Purchase the appropriate rate
- Save `easypost_shipment_id` and `tracking_code` back to the orders table
- Optionally send a shipping confirmation email with the tracking code
- Requires `@easypost/api` installed and `EASYPOST_API_KEY` set in the environment

---

### B13 · No Multi-Currency Support in API Responses

All price fields must be accompanied by a `currency` field in every API response. Products default to `GBP`. Orders and payments must store and return their currency. The frontend uses this to display the correct symbol.

---

### B14 · No Order Export Endpoint

`GET /api/admin/orders/export` does not exist. The PRD lists order data export as an admin capability. Needs a controller that joins all order data, formats as CSV, and sends with `Content-Type: text/csv` and `Content-Disposition: attachment; filename=inflexa-orders.csv`.

---

### B15 · No Rate Limiting on Auth Endpoints

Install `express-rate-limit` and apply a limiter to `/api/auth/login` and `/api/auth/register` (PRD requirement).

---

### B16 · No HTTP Security Headers

`helmet` is not installed. Add `app.use(helmet())` as the first middleware in `server.ts` (PRD requirement).

---

### B17 · CORS Fully Open

Must be locked to the Inflexa frontend domain: `cors({ origin: process.env.CLIENT_URL, credentials: true })`.

---

### B18 · No Environment Variable Validation on Startup

Add a startup check for all required variables. Call `process.exit(1)` with a clear list of missing vars if any are absent. Required vars: `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `EASYPOST_API_KEY`, `CLIENT_URL`, and email service credentials.

---

### B19 · No Global Error Handler

No Express error-handling middleware exists. Add it as the last middleware in `server.ts`, along with a 404 catch-all before it.

---

### B20 · No Input Sanitisation

All pg queries must use parameterised queries — never string concatenation. Add XSS sanitisation for text fields stored in the database.

---

### B21 · No User Order History Endpoint

`GET /api/orders` filtered by the logged-in user does not exist. The User Account page needs the user's own order history. Needs a controller querying orders by `user_id = req.user.id` with joined `order_items` and `products` data.

---

### B22 · getPaymentDetails Never Registered as a Route

`getPaymentDetails` is exported from `paymentController.ts` but never mounted in `payments.ts`. Add `GET /api/payments/:paymentId` with `authMiddleware`.

---

## Summary

| Category | Count |
|---|---|
| Bugs — Part A | 19 |
| Gaps — Part B | 22 |
| **Total** | **41** |

---

## Priority Order for the Backend Engineer

1. Decide on ORM (Prisma or TypeORM recommended for PostgreSQL + TypeScript) and rewrite all four models with the correct table schemas (A10–A13)
2. Fix `server.ts`: load dotenv, remove Mongoose entirely, wire pg pool correctly, add helmet and error handler (A3)
3. Create SQL migration files for all tables (B1)
4. Fix all route import name mismatches (A4, A14, A16, A18)
5. Fix all controller imports and rewrite all DB calls as pg/ORM queries (A6–A9)
6. Add missing validators, fix auth logic, add auth to unprotected routes (A5, A6, A15)
7. Build missing endpoints in order: B2 → B3 → B4 → B9 → B10 → B11 → B12

---

*Every finding in this document is based on direct reading of all 19 backend source files. No assumptions were made.*

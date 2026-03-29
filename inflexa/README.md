# Flashcard Store

## Overview
The Flashcard Store is a custom-built web application designed to provide parents and educators with offline-first gamified flashcard packs for children. The platform allows users to browse, purchase, and manage educational flashcards, with a focus on physical and printable packs.

## Technology Stack
- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Styling**: CSS (Green and White color scheme)

## Features
- User-friendly interface for browsing and purchasing flashcard packs.
- Admin dashboard for managing products, orders, and inventory.
- Secure payment processing through third-party gateways (e.g., Stripe).
- Responsive design for optimal viewing on various devices.

## Project Structure
```
flashcard-store
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── styles
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   │   ├── routes
│   │   ├── controllers
│   │   ├── models
│   │   ├── middleware
│   │   ├── config
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd flashcard-store
   ```

2. Install dependencies for the client:
   ```
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```
   cd ../server
   npm install
   ```

4. Set up the database and update the configuration in `server/src/config/database.ts`.

## Running the Application
- Start the server:
  ```
  cd server
  npm run dev
  ```

- Start the client:
  ```
  cd client
  npm start
  ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.




inflexa/server/
├── src/
│   ├── config/
│   │   ├── database.ts                  # PG pool + connection test
│   │   ├── env.ts                       # Env validation + typed config
│   │   └── stripe.ts                    # Stripe client init
│   │
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_products.sql
│   │   ├── 003_create_orders.sql        # orders + order_items
│   │   ├── 004_create_payments.sql
│   │   └── runMigrations.ts             # Executes all SQL files in order
│   │
│   ├── types/
│   │   ├── express.d.ts                 # Extend Request with user
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── payment.types.ts
│   │
│   ├── models/
│   │   ├── userModel.ts                 # users table queries
│   │   ├── productModel.ts              # products table queries
│   │   ├── orderModel.ts                # orders table queries
│   │   ├── orderItemModel.ts            # order_items table queries
│   │   └── paymentModel.ts              # payments table queries
│   │
│   ├── middleware/
│   │   ├── authenticate.ts              # JWT verification → req.user
│   │   ├── authorize.ts                 # Role check (admin)
│   │   ├── rateLimiter.ts               # Rate limit configs
│   │   ├── errorHandler.ts              # Global error + 404
│   │   └── validate.ts                  # Generic validation runner
│   │
│   ├── validators/
│   │   ├── authValidators.ts            # register + login rules
│   │   ├── productValidators.ts         # create + update product rules
│   │   ├── orderValidators.ts           # create order + update status rules
│   │   └── paymentValidators.ts         # payment intent rules
│   │
│   ├── services/
│   │   ├── authService.ts               # Hash, compare, sign JWT, verify
│   │   ├── productService.ts            # Product CRUD + filtering
│   │   ├── inventoryService.ts          # Stock check + decrement (separated!)
│   │   ├── orderService.ts              # Create order (with tx), get by ID
│   │   ├── orderHistoryService.ts       # User history + admin list
│   │   ├── orderExportService.ts        # CSV generation
│   │   ├── paymentService.ts            # Stripe intent + webhook processing
│   │   ├── emailService.ts              # Nodemailer + order confirmation
│   │   └── shippingService.ts           # EasyPost shipment + tracking
│   │
│   ├── controllers/
│   │   ├── authController.ts            # register, login, getMe
│   │   ├── productController.ts         # getAll (with filters), getById
│   │   ├── orderController.ts           # createOrder, getMyOrders, getMyOrderById
│   │   ├── paymentController.ts         # createIntent, webhook
│   │   ├── admin/
│   │   │   ├── adminProductController.ts  # CRUD + inventory update
│   │   │   └── adminOrderController.ts    # list, updateStatus, export
│   │
│   ├── routes/
│   │   ├── index.ts                     # Master router
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts             # Public product routes
│   │   ├── orderRoutes.ts               # User order routes
│   │   ├── userRoutes.ts                # /api/users/me
│   │   ├── paymentRoutes.ts
│   │   └── admin/
│   │       ├── index.ts                 # Admin master router
│   │       ├── adminProductRoutes.ts
│   │       └── adminOrderRoutes.ts
│   │
│   ├── utils/
│   │   ├── logger.ts                    # Structured logging
│   │   ├── apiResponse.ts              # Standardized response helpers
│   │   └── csvExporter.ts              # Generic CSV builder
│   │
│   └── server.ts                        # Lean entry point
│
├── package.json
├── tsconfig.json
└── .env.example

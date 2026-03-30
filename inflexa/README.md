# Inflexa - Offline-First Gamified Flashcard Store

## Overview

Inflexa is a custom-built web application for parents and educators to browse, purchase, and receive offline-first gamified flashcard packs for children. The platform supports physical and printable flashcard packs with secure Stripe payments, EasyPost shipping, and a full admin dashboard.

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16
- **Payments**: Stripe
- **Shipping**: EasyPost
- **Email**: Nodemailer (SMTP)
- **Frontend**: React, TypeScript (planned)

## Project Structure

```
inflexa/
├── client/                          # Frontend (planned)
│   └── materials/                   # Design assets, logos, mockups
├── server/
│   ├── deploy/                      # Deployment scripts and systemd service
│   │   ├── deploy.sh                # Full VPS deployment script
│   │   ├── update.sh                # Zero-downtime update script
│   │   └── inflexa.service          # systemd service file
│   ├── nginx/                       # Nginx reverse proxy config
│   │   └── inflexa.conf
│   ├── src/
│   │   ├── config/                  # Database, env, Stripe config
│   │   ├── controllers/             # Route handlers
│   │   │   └── admin/               # Admin-only controllers
│   │   ├── middleware/              # Auth, validation, rate limiting, logging
│   │   ├── migrations/              # SQL migration files and runner
│   │   ├── models/                  # Database query layer
│   │   ├── routes/                  # Express route definitions
│   │   │   └── admin/               # Admin-only routes
│   │   ├── scripts/                 # CLI utilities (create-admin)
│   │   ├── services/                # Business logic layer
│   │   ├── types/                   # TypeScript type definitions
│   │   ├── utils/                   # Helpers (logger, CSV, currency, API response)
│   │   └── validators/              # Input validation rules
│   │   └── server.ts                # Application entry point
│   ├── tests/                       # End-to-end API tests
│   ├── .env.example                 # Environment variable template
│   ├── .env.test                    # Test environment config
│   ├── .env.production.example      # Production environment template
│   ├── Dockerfile                   # Multi-stage production Docker build
│   ├── docker-compose.yml           # Docker Compose for local/production
│   ├── package.json
│   └── tsconfig.json
└── EDU.md                           # Product Requirements Document
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Stripe account (test keys for development)
- EasyPost account
- SMTP credentials

### Setup

```bash
cd inflexa/server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm run create-admin
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run migrate` | Run database migrations |
| `npm run create-admin` | Create the first admin user |
| `npm test` | Run end-to-end test suite |

## API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/products` - Browse products (supports search, age, subject, format filters)
- `GET /api/products/:id` - Product detail
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/orders/guest` - Guest checkout
- `GET /api/orders/guest/:id` - Guest order lookup
- `POST /api/payments/guest/create-intent` - Guest payment

### Authenticated
- `GET /api/users/me` - User profile
- `PUT /api/users/password` - Change password
- `POST /api/orders` - Create order
- `GET /api/orders` - Order history
- `GET /api/orders/:id` - Order detail
- `POST /api/payments/create-intent` - Create payment
- `GET /api/payments/:paymentId` - Payment detail

### Admin
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/inventory` - Update inventory
- `POST /api/admin/products/:id/image` - Upload product image
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/export` - Export orders as CSV
- `GET /api/admin/orders/unshipped` - View paid orders awaiting shipment
- `GET /api/admin/orders/:id` - Order detail
- `PUT /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/orders/:id/ship` - Trigger shipment

## Deployment

See [DEPLOY.md](server/DEPLOY.md) for full deployment instructions including Docker, VPS, and manual methods.

## License

MIT

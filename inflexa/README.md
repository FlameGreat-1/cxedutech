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

## Deployment

See [DEPLOY.md](server/DEPLOY.md) for full deployment instructions including Docker, VPS, and manual methods.

## License

MIT


npx jest tests/06-errors.test.ts --runInBand --forceExit --verbose


https://interpulmonary-noncontemptuous-royal.ngrok-free.dev/api/payments/paystack/webhook


Card Number: 5078 5078 5078 5078 12
Expiry: Any future date (e.g. 09/30)
CVV: 081
OTP: 123456 (if prompted)
PIN: 1234 (if prompted)





Yes, real SVG icons would look better. The current icons are single-path Heroicons outlines which are generic and don't visually represent the specific concepts (adaptive learning, offline, age groups, printable). Custom SVG icons designed for each feature would be more meaningful and professional.

But you don't need to add them to `public/icons/`. The better approach is to inline the SVGs directly in the component as React elements. This way:

- No extra HTTP requests to load icon files
- Icons render instantly with the card (no flash of missing icon)
- Icons inherit the `accentColor` styling automatically
- No file path management

When you have the SVG files ready, share the SVG code for each of the four cards and I'll inline them directly into the HomePage card data. Or if you prefer the file-based approach with `<img src="/icons/...">`, I can do that too. What do you prefer?





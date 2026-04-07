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



# Stripe Test Card Details
Card Number: 4242 4242 4242 4242
Expiry:  12/30
CVV: 081

IP/Postal Code: 12345

# Shipping     - To Address (US)
Name: Test Customer
Address: 350 Fifth Avenue
City: New York
State: NY
Zip: 10118
Country: US

# Shipping     - To Address (Uk)
Name: Test Customer
Address: 10 Downing Street
City: London
State: London
Postal Code: SW1A 2AA
Country: United Kingdom

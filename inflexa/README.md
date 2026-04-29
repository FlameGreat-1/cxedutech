# Inflexa - Offline-First Gamified Flashcard Store

## Overview

Inflexa is a custom-built web application for parents and educators to browse, purchase, and receive offline-first gamified flashcard packs for children. The platform supports physical and printable flashcard packs with secure Stripe payments, EasyPost shipping, and a full admin dashboard.

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Payments**: Stripe, Paystack
- **Shipping**: ShipEngine, Shippo, Easyship
- **Email**: Nodemailer (SMTP)
- **Deployment**: Docker Compose, Nginx, Let's Encrypt

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (for production)
- Stripe account (test keys for development)
- SMTP credentials

### Local Development

```bash
# Install dependencies
make install

# Start backend dev server (port 5000)
make dev-server

# In another terminal, start frontend (port 3000)
make dev-client
```

### Docker (Production-Like)

```bash
# Build and start all services
make build

# Run database migrations
make db-migrate

# Create admin user
make db-create-admin

# Check health
make health
```

### Available Commands

Run `make help` for the full list, or `make menu` for an interactive guide.

| Command | Description |
|---|---|
| `make up` | Start all containers |
| `make down` | Stop all containers |
| `make build` | Rebuild and start all containers |
| `make logs` | Tail all container logs |
| `make health` | Check service health |
| `make db-migrate` | Run database migrations |
| `make db-create-admin` | Create the first admin user |
| `make test-server` | Run server test suite |
| `make menu` | Interactive CLI menu |

## Deployment

See [DEPLOY.md](DEPLOY.md) for full deployment instructions for Hostinger VPS (Ubuntu 24.04 LTS).

**Live URLs:**
- Primary: `https://inflexatechnologies.com`
- Alternate: `https://inflexatechnologies.co.uk` (redirects to .com)

Quick start:
```bash
ssh root@YOUR_VPS_IP
git clone https://github.com/FlameGreat-1/cxedutech /opt/inflexa
cd /opt/inflexa/inflexa
sudo bash deploy.sh
```

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

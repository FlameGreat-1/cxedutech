# ============================================================================
# Stage 1: Build the Vite React application
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time environment variables for Vite
ARG VITE_API_URL=/api
ARG VITE_STRIPE_PUBLIC_KEY
ARG VITE_PAYSTACK_PUBLIC_KEY

# Set them as env vars so Vite can embed them during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY

# Install dependencies (cached unless package files change)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ============================================================================
# Stage 2: Serve with Nginx
# ============================================================================
FROM nginx:1.27-alpine AS production

# Add dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Remove default Nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Non-root Nginx (optional hardening: Nginx master runs as root for port 80)
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

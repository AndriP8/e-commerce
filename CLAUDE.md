# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce application built with Next.js 15, PostgreSQL, and Stripe for payment processing. Features user authentication, product browsing, shopping cart, checkout, and order management with multi-currency support.

## Development Commands

### Environment Setup
```bash
# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env.local
# Required: DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
```

### Database Management
```bash
# Initialize database with schema and seed data (runs 24 SQL migration files in order)
pnpm db:setup

# Drop all database tables (destructive!)
pnpm db:drop

# Reset database (drop + setup)
pnpm db:reset
```

### Development Server
```bash
# Start development server with Turbopack (default port: 3001)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Directory Structure
- `src/app/(user-facing)/` - User-facing pages (home, products, cart, checkout, orders)
- `src/app/api/` - API routes organized by domain (auth, products, cart, checkout, orders, currencies)
- `src/app/contexts/` - React contexts (Auth, Currency, CheckoutCost, Csrf)
- `src/app/utils/` - Utility functions and shared logic
- `src/app/components/` - Reusable UI components
- `src/app/db/` - Database connection pool configuration
- `scripts/` - Database migration SQL files (numbered 001-024)

### Key Architectural Patterns

#### Database Connection
- Uses PostgreSQL connection pool via `pg` library (`src/app/db/client.ts`)
- Pool configuration: max 100 (prod) / 20 (dev) connections, min 5, 30s idle timeout
- Always use `pool.connect()` and release client in finally block

#### Authentication Flow
- JWT-based authentication with httpOnly cookies
- Token generation/verification in `src/app/utils/auth-utils.ts`
- Password hashing with bcryptjs (10 salt rounds)
- Middleware protection at `src/middleware.ts` - redirects unauthenticated users to /login
- Public paths: /, /login, /register, /products, /api/auth/*
- Context provider in `src/app/contexts/AuthContext.tsx` for client-side auth state

#### Middleware Layer (src/middleware.ts)
Middleware runs in this order:
1. Rate limiting (30 req/sec) via `rateLimitMiddleware`
2. CSRF protection for all /api/* routes via `csrfProtection`
3. Currency preference handling for product/cart/checkout/order APIs
4. Authentication check for protected routes

#### Multi-Currency System
- Supported currencies stored in database with exchange rates
- User preferences saved in `user_preferences` table
- Currency code stored in `preferred_currency` cookie
- Server-side currency utils: `src/app/utils/server-currency-utils.ts`
- Client-side currency utils: `src/app/utils/currency-utils.ts`
- Real-time conversion via `/api/currency/convert` endpoint
- All orders store currency_code and amounts in user's selected currency

#### Error Handling
- Custom error classes in `src/app/utils/api-error-handler.ts`:
  - `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403)
  - `NotFoundError` (404), `ConflictError` (409), `InternalServerError` (500)
- Use `handleApiError(error)` to convert errors to JSON responses
- Client-side error boundaries: `src/app/error.tsx`, `src/app/global-error.tsx`

#### State Management
- React Context for global state (Auth, Currency, CheckoutCost, CSRF)
- useReducer for complex forms (checkout, cart items)
- Reducer patterns in:
  - `src/app/(user-facing)/checkout/components/checkoutReducer.ts`
  - `src/app/(user-facing)/cart/components/cartItemReducer.ts`

#### Security Features
- CSRF protection using `csrf` package (tokens in cookies and headers)
- Rate limiting using in-memory store with IP-based tracking
- Security headers configured in production (see DEPLOYMENT.md)
- Password requirements enforced server-side
- HttpOnly cookies for JWT tokens (24h expiration)
- Stripe payment integration with server-side validation

### API Route Patterns

All API routes follow this structure:
```typescript
export async function GET/POST/PUT/DELETE(request: NextRequest) {
  const client = await pool.connect();
  try {
    // 1. Get auth token and verify user (if needed)
    const token = request.cookies.get("token")?.value;
    const user = await getCurrentUser(token);

    // 2. Extract request data (body, params, search params)

    // 3. Database operations using client
    const result = await client.query(/* SQL */, [params]);

    // 4. Return NextResponse with JSON
    return NextResponse.json({ data });
  } catch (error) {
    const { status, message } = handleApiError(error);
    return NextResponse.json({ error: message }, { status });
  } finally {
    client.release(); // CRITICAL: Always release client
  }
}
```

### Database Schema Highlights

24 migration files create these core tables:
- `users` - User accounts with password hashing
- `user_addresses` - Multiple addresses per user
- `categories` - Product categories
- `products` - Product catalog with seller references
- `product_variants` - Size/color variations
- `product_images` - Multiple images per product
- `shopping_carts` - User shopping carts
- `cart_items` - Items in carts
- `orders` - Order records with currency_code
- `order_items` - Line items in orders
- `payments` - Payment tracking (Stripe integration)
- `shipments` - Shipment tracking
- `currencies` - Supported currencies
- `exchange_rates` - Currency conversion rates
- `user_preferences` - User settings including currency

### Stripe Integration

- Client-side: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Server-side: `stripe` package in `src/app/utils/stripe.ts`
- Payment flow:
  1. Create order → `/api/checkout/create-order`
  2. Create payment intent → `/api/checkout/payment-intent`
  3. Client confirms payment with Stripe Elements
  4. Update payment status → `/api/checkout/update-payment/[orderId]`
- Test mode keys in development, production keys in production

## Important Conventions

### Image Handling
- Images served from CDN: `NEXT_PUBLIC_CDN_URL` (https://cdn.andripurnomo.com/e-commerce)
- Custom image loader in `src/utils/image-loader.ts`
- Supported formats: WebP, AVIF
- Cache TTL: 30 days
- Remote patterns configured in `next.config.ts`

### TypeScript Patterns
- Strict mode enabled
- Type definitions in `src/app/types/`:
  - `cart.ts`, `orders.ts`, `product-types.ts`, `currency.ts`
- Prefer interfaces for data structures from database
- Use type for unions and computed types

### API Response Format
Success responses:
```typescript
{ data: { /* payload */ } }
```

Error responses:
```typescript
{ error: "Error message" }
```

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_CDN_URL` - CDN URL for product images
- `NEXT_PUBLIC_BASE_URL` - Application base URL

### Database Migration Pattern
- SQL files in `scripts/` directory numbered 001-024
- Migrations tracked in `schema_migrations` table
- Run via `pnpm db:setup` which executes only pending migrations
- Never modify existing migration files, always create new ones
- Migration format: `###-descriptive-name.sql`

### Performance Optimizations
- Connection pooling with configurable min/max
- Web Vitals monitoring via `src/app/components/WebVitals.tsx`
- Performance hooks in `src/app/hooks/usePerformance.ts`
- Debounce utility for search: `src/app/utils/debounce.ts`
- Static asset caching (30 days for /_next/static)
- Production: console.log statements removed automatically

## Deployment

See `DEPLOYMENT.md` for comprehensive VPS deployment guide including:
- Docker containerization
- Nginx reverse proxy with SSL/TLS
- GitHub Actions CI/CD
- Database backups and health monitoring
- Production ports: App (3002), PostgreSQL (5433)

## Testing and Debugging

### Local Database Access
```bash
# Connect to local PostgreSQL
psql $DATABASE_URL

# List tables
\dt

# View schema migrations
SELECT * FROM schema_migrations ORDER BY version;
```

### Common Issues

**Port conflicts**: Default dev port is 3001 (not 3000)

**Database connection errors**: Verify DATABASE_URL format and PostgreSQL is running

**Migration failures**: Check `schema_migrations` table for executed versions, manually delete if needed to retry

**Stripe webhooks**: Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`

**CSRF errors**: Ensure CSRF token is fetched from `/api/csrf` and included in X-CSRF-Token header

**Currency not persisting**: Check `preferred_currency` cookie is being set in middleware

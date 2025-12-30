# E-Commerce Application

This is a full-featured e-commerce application built with Next.js, PostgreSQL, and Stripe for payment processing.

## Features

- User authentication (login/register)
- Product browsing and searching
- Shopping cart functionality
- Checkout process with Stripe integration
- Order management and tracking
- SEO optimizations:
  - Page-specific meta tags (title, description, keywords)
  - Canonical URLs to prevent duplicate content
  - Dynamic sitemap.xml generation
  - Robots.txt configuration

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- pnpm 10.x or higher
- PostgreSQL database
- Stripe account for payment processing

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up PostgreSQL database:

   - Install PostgreSQL locally or use Docker
   - Create a database for the application
   - Copy `.env.example` to `.env.local` and update `DATABASE_URL`

4. Set up environment variables:

   - Add your Stripe API keys (get them from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys))
   - Configure other required environment variables

5. Initialize the database with schema and seed data:

```bash
pnpm db:setup
```

6. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the application.

### Database Management

- **Setup database**: `pnpm db:setup` - Creates all tables and seeds initial data
- **Drop database**: `pnpm db:drop` - Drops all tables (use with caution!)
- **Reset database**: `pnpm db:reset` - Drops and recreates all tables with fresh seed data

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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

- Node.js 18.x or higher
- PostgreSQL database
- Stripe account for payment processing

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Stripe API keys (get them from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys))

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

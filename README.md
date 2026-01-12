# 🛒 Production-Ready E-Commerce Platform

A full-stack, production-ready e-commerce application built with modern web technologies, featuring comprehensive security, multi-currency support, and automated deployment. This project demonstrates enterprise-level architecture and best practices for scalable web applications.

**🔗 Live Demo:** [e-commerce.andripurnomo.com](https://e-commerce.andripurnomo.com)

![Architecture Diagram](./high-level-design.png)

---

## 🎯 Project Highlights

- ✅ **Production-deployed** on VPS with Docker, Nginx, and automated CI/CD
- 🔒 **Enterprise-grade security** with CSRF protection, JWT authentication, and secure password hashing
- 🌍 **Multi-currency support** with real-time exchange rates
- 💳 **Stripe payment integration** for secure checkout
- 🚀 **Modern tech stack**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- 📊 **Type-safe database** with PostgreSQL and automated type generation
- 🔄 **25+ database migrations** with proper schema versioning
- 📱 **SEO-optimized** with dynamic sitemaps, meta tags, and canonical URLs
- 🐳 **Dockerized** with multi-stage builds and docker-compose orchestration

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 15.4** - React framework with App Router and Server Components
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Turbopack** - Ultra-fast development server
- **Lucide React** - Modern icon library
- **Sonner** - Beautiful toast notifications
- **nuqs** - Type-safe URL search params

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **PostgreSQL 17** - Relational database with Alpine Linux
- **Kanel** - Automatic TypeScript type generation from database schema
- **JWT (jose)** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **CSRF Protection** - Custom middleware for security

### Payment & Integration
- **Stripe** - Payment processing with React Stripe.js
- **CDN Integration** - Optimized asset delivery

### DevOps & Deployment
- **Docker** - Containerized application
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy with SSL/TLS, security headers, rate limiting
- **GitHub Actions** - Automated CI/CD pipeline
- **Let's Encrypt** - Free SSL certificates with auto-renewal

### Development Tools
- **pnpm** - Fast, disk-efficient package manager
- **ESLint** - Code linting
- **Volta** - Node.js version management

---

## ✨ Key Features

### 🔐 Security
- **CSRF Protection** - Prevents cross-site request forgery attacks
- **JWT Authentication** - Secure, stateless user sessions
- **Password Hashing** - bcrypt with salt rounds
- **Secure Cookies** - HttpOnly, Secure, SameSite flags
- **Security Headers** - HSTS, X-Frame-Options, CSP, XSS Protection
- **Rate Limiting** - Nginx-based request throttling (30 req/s)

### 💰 E-Commerce Core
- **Product Management** - SEO-friendly slugs, variants, images, attributes
- **Shopping Cart** - Persistent cart with real-time updates
- **Multi-Currency** - Support for multiple currencies with live exchange rates
- **Stripe Checkout** - Secure payment processing
- **Order Management** - Complete order lifecycle tracking
- **User Profiles** - Address management and order history

### 🎨 User Experience
- **Responsive Design** - Mobile-first approach
- **Server Components** - Improved performance and SEO
- **Optimistic Updates** - Instant UI feedback
- **Toast Notifications** - User-friendly feedback
- **Loading States** - Skeleton screens and spinners

### 📈 SEO & Performance
- **Dynamic Sitemap** - Auto-generated XML sitemap
- **Meta Tags** - Page-specific titles, descriptions, keywords
- **Canonical URLs** - Prevent duplicate content
- **Robots.txt** - Search engine directives
- **Image Optimization** - Next.js Image component with CDN
- **Static Asset Caching** - 60-day cache for `/_next/static`
- **Gzip Compression** - Nginx-based compression

### 🗄️ Database
- **25+ Migrations** - Versioned schema management
- **Type-Safe Queries** - Auto-generated TypeScript types
- **Relational Design** - Normalized schema with foreign keys
- **Seed Data** - Sample products and categories
- **Automated Backups** - Daily PostgreSQL dumps (production)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.x or higher (managed via Volta)
- **pnpm** 10.x or higher
- **PostgreSQL** 17 (local or Docker)
- **Stripe Account** - [Get API keys](https://dashboard.stripe.com/test/apikeys)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_CDN_URL=https://cdn.andripurnomo.com/e-commerce
   
   POSTGRES_USER=your_user
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=ecommerce_dev
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_dev
   
   JWT_SECRET=your-secret-key-min-32-chars
   JWT_EXPIRES_IN=7d
   
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Initialize database**
   ```bash
   pnpm db:setup
   ```
   This runs all 25+ migration scripts and seeds sample data.

5. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3001](http://localhost:3001) in your browser.

### Database Management Commands

```bash
pnpm db:setup   # Create tables and seed data
pnpm db:drop    # Drop all tables (⚠️ destructive)
pnpm db:reset   # Drop and recreate with fresh data
```

---

## 🐳 Docker Deployment

### Local Docker Setup

```bash
# Build and start containers
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Production Deployment

**Automated CI/CD Pipeline** with GitHub Actions:
- ✅ Runs tests and linting on every push
- ✅ Auto-deploys to VPS on successful CI (main branch)
- ✅ SSH-based deployment with secure secrets
- ✅ Zero-downtime deployment with Docker

**Deployment Flow:**
```
Push to main → CI checks → Build & test → Deploy to VPS → Health check
```

**Manual deployment:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Tech Stack:**
- Docker + Docker Compose for containerization
- Nginx reverse proxy with SSL/TLS (Let's Encrypt)
- PostgreSQL 17 with automated backups
- GitHub Actions for CI/CD automation

---

## 📁 Project Structure

```
e-commerce/
├── src/
│   ├── app/
│   │   ├── (user-facing)/      # Public pages (home, products, cart, checkout)
│   │   ├── api/                # API routes (auth, cart, products, orders, CSRF)
│   │   ├── actions/            # Server actions
│   │   ├── components/         # Shared components (Header, Footer, CurrencySelector)
│   │   ├── contexts/           # React contexts (Auth, Currency, CSRF)
│   │   ├── hooks/              # Custom hooks (useApi, useAuth)
│   │   ├── db/                 # Database connection
│   │   ├── utils/              # Utilities (CSRF, JWT, API client)
│   │   └── types/              # TypeScript types
│   ├── schemas/                # Auto-generated DB types (Kanel)
│   └── middleware.ts           # CSRF protection, currency, auth
├── scripts/                    # 25+ database migration SQL files
├── public/                     # Static assets
├── docs/                       # Additional documentation
├── .github/workflows/          # CI/CD automation
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Container orchestration
├── deploy.sh                   # Automated deployment script
├── DEPLOYMENT.md               # Production deployment guide
└── high-level-design.png       # Architecture diagram
```

---

## 🔌 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |
| `/api/products` | GET | List products with currency conversion |
| `/api/products/[slug]` | GET | Get product by slug |
| `/api/cart` | GET | Get user's cart |
| `/api/cart/add` | POST | Add item to cart |
| `/api/cart/remove` | DELETE | Remove item from cart |
| `/api/cart/update` | PATCH | Update cart item quantity |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/orders` | GET | Get user's orders |
| `/api/currencies` | GET | List supported currencies |
| `/api/currency` | POST | Update currency preference |
| `/api/csrf` | GET | Get CSRF token |

---

## 🧪 Testing & Quality

- **Type Safety** - Full TypeScript coverage with strict mode
- **Database Types** - Auto-generated from schema (Kanel)
- **ESLint** - Code quality enforcement
- **Production Testing** - Deployed and tested on live VPS

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete VPS deployment guide with Nginx, Docker, CI/CD
- **[REQ-EXPLORATION.MD](./REQ-EXPLORATION.MD)** - Requirements analysis and exploration
- **[CLAUDE.md](./CLAUDE.md)** - Development notes and AI assistance log
- **[high-level-design.png](./high-level-design.png)** - System architecture diagram

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

✅ **Full-Stack Development** - End-to-end application development  
✅ **Modern React** - Server Components, Server Actions, Suspense  
✅ **TypeScript** - Advanced types, generics, type safety  
✅ **Database Design** - Normalized schema, migrations, type generation  
✅ **Security** - CSRF, JWT, password hashing, secure headers  
✅ **DevOps** - Docker, CI/CD, Nginx, SSL/TLS, monitoring  
✅ **Payment Integration** - Stripe checkout and webhooks  
✅ **API Design** - RESTful endpoints, error handling  
✅ **SEO** - Meta tags, sitemaps, canonical URLs  
✅ **Performance** - Caching, compression, CDN, optimization  

---

## 🛠️ Development

### Available Scripts

```bash
pnpm dev        # Start development server with Turbopack
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm db:setup   # Initialize database
pnpm db:drop    # Drop all tables
pnpm db:reset   # Reset database
```

### Environment Variables

See `.env.example` for all required environment variables.

---

## 📝 License

This project is part of a portfolio demonstration.

---

## 👤 Author

**Andri Purnomo**

- Portfolio: [andripurnomo.com](https://andripurnomo.com)
- GitHub: [@AndriP8](https://github.com/AndriP8)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Payments by [Stripe](https://stripe.com/)
- Deployed on VPS with [Docker](https://www.docker.com/)
- Icons by [Lucide](https://lucide.dev/)

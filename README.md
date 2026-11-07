# سیستم مدیریت سفارش

A comprehensive order management application for print shops, built with Next.js 15, Prisma, PostgreSQL, and NextAuth. The system handles employees, customers, orders, services, payments, file uploads, and reporting with full Persian/Jalali date support.

## Key Features

- **Order Management**: Full lifecycle from creation to delivery with status transitions, priorities, assignments, file attachments, and activity logs
- **Customer Management**: Customer profiles with types (Normal, Student, Business), contact info, order history, and debt tracking
- **Employee Management**: Staff directory with roles, performance tracking, and commission calculation
- **Service Catalog**: Hierarchical categories and services with optional base pricing
- **Payment Tracking**: Multiple payment methods, partial payments, and remaining balance calculation
- **File Uploads**: Versioned file attachments per order
- **Role-Based Access Control**: Managers (ADMIN) and Employees (STAFF) with distinct permissions
- **Reports Dashboard**: Revenue, overdue orders, employee performance, and monthly commissions
- **Persian/Jalali Dates**: Native Jalali calendar integration for all date inputs and displays
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Global loading overlay for server actions
- **Pagination**: 20 items per page on order listings

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Authentication | NextAuth.js v5 (Credentials provider) |
| Styling | Tailwind CSS v4 (RTL support) |
| Date Handling | date-fns-jalali |
| Validation | Zod |
| UI Components | Custom (Radix-inspired) |

## User Roles and Permissions

| Feature | Manager (ADMIN) | Employee (STAFF) |
|---------|-----------------|------------------|
| View orders | ✅ All | ✅ All |
| Create orders | ✅ | ✅ |
| Edit own orders | ✅ | ✅ |
| Edit any order | ✅ | ❌ |
| Delete own orders | ✅ | ✅ |
| Delete any order | ✅ | ❌ |
| Change order status | ✅ All | ✅ Own only |
| Manage customers | ✅ Full CRUD | ✅ Quick create only |
| Manage employees | ✅ Full CRUD | ❌ |
| Manage services/categories | ✅ Full CRUD | ❌ |
| View reports | ✅ | ❌ |
| Set default customer/assignee | ✅ | ❌ |

**Order Ownership Rule**: Employees can only modify (edit, delete, status change) orders they created. Managers have unrestricted access to all orders.

## Core Application Functionality

### Orders
- Sequential order numbers (starting from 1000)
- Status workflow: NEW → REVIEWING → IN_PROGRESS → READY → DELIVERED (with side transitions to ON_HOLD, NEEDS_REVISION, CANCELLED)
- Priorities: Normal, Urgent, Very Urgent
- Custom creation date/time (defaults to now)
- Expected delivery date with Jalali picker
- Internal notes and customer-facing descriptions
- Assignee assignment with default assignee support
- Versioned file uploads
- Payment recording with multiple methods
- Full activity log and status history

### Customers
- Types: Normal, Student, Business
- Optional default customer for quick order creation
- Debt calculation across all non-cancelled orders
- Search by name or mobile

### Employees
- Linked to authentication users (username/password)
- Role fixed as STAFF (managers are ADMIN users)
- Performance metrics: total/delivered/in-progress/cancelled orders
- Monthly commission tiers: 3% (≤100M), 5% (100M–200M), 7% (>200M)
- Default assignee designation

### Services
- Two-level hierarchy: Category → Service
- Optional base price per service
- Active/inactive toggles

### Reports
- Monthly revenue, collected amount, and outstanding debt
- Overdue orders list
- Employee delivery performance for current month

## Prerequisites

- Node.js 20+
- PostgreSQL database (local, Docker, or cloud provider like Neon, Supabase, Vercel Postgres)
- pnpm / npm / yarn

## Installation and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Print-Shop

# Install dependencies
npm install

# Configure environment variables (see below)
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, AUTH_URL

# Set up database
npm run db:migrate

# Seed initial data (admin user, sample categories/services/employees)
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`. Default login: `admin` / `admin123`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (see `.env.example` for format) | Yes |
| `AUTH_SECRET` | Secret for NextAuth session encryption (generate with `openssl rand -base64 32`) | Yes |
| `AUTH_URL` | Base URL of the application (e.g., `http://localhost:3000` or production URL) | Yes |

**Example `.env`:**
```env
# PostgreSQL (production - Vercel, Neon, Supabase, etc.)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# SQLite (local development only - does not work on Vercel)
# DATABASE_URL="file:./dev.db"

AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"
```

> **Note**: Never commit `.env` files. Use `.env.example` as a template. The `.gitignore` excludes all `.env*` files except `.env.example`.

## Database Setup and Prisma Commands

```bash
# Run migrations (development)
npm run db:migrate

# Generate Prisma Client (runs automatically during build)
npx prisma generate

# Open Prisma Studio (visual database browser)
npm run db:studio

# Seed database with initial data
npm run db:seed

# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Deploy migrations to production
npx prisma migrate deploy
```

The Prisma schema (`prisma/schema.prisma`) uses PostgreSQL provider. For local SQLite development, change the `provider` to `"sqlite"` and use a file-based `DATABASE_URL`.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Production build (runs prisma generate + next build)
npm run build

# Start production server
npm run start

# Lint codebase
npm run lint

# Type-check (if configured)
npx tsc --noEmit
```

## Production Build and Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Deployment Notes:**
- Ensure `DATABASE_URL` points to a production PostgreSQL instance
- Set a strong `AUTH_SECRET` in production
- Set `AUTH_URL` to your production domain
- Run `npx prisma migrate deploy` as part of your deployment pipeline
- The application works on Vercel, Docker, or any Node.js hosting platform

### Docker (Optional)
A `docker-compose.yml` is provided for local development with PostgreSQL:
```bash
docker-compose up -d
# Then update .env DATABASE_URL to point to the local container
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── orders/           # Order list, detail, create, edit
│   │   ├── customers/        # Customer list, detail, create
│   │   ├── employees/        # Employee list, detail, create (manager only)
│   │   ├── services/         # Service/category management (manager only)
│   │   ├── reports/          # Reports dashboard (manager only)
│   │   ├── layout.tsx        # Dashboard layout with sidebar, toast, loading
│   │   └── page.tsx          # Dashboard home
│   ├── actions/
│   │   ├── orders.ts         # Server actions for order CRUD, status, payments, files
│   │   └── entities.ts       # Server actions for customers, employees, services
│   ├── api/
│   │   └── auth/[...nextauth]/ # NextAuth route handlers
│   ├── login/                # Login page
│   └── globals.css           # Global styles, Tailwind, RTL
├── components/
│   ├── ui/                   # Reusable UI primitives (Button, Input, Modal, Toast, Loading, etc.)
│   ├── layout/               # Sidebar, TopSearch, LogoutButton, ThemeToggle
│   ├── orders/               # Order-specific components (forms, tables, badges, actions)
│   ├── customers/            # Customer table rows, quick-create modal
│   ├── employees/            # Employee delete modal
│   └── theme/                # Theme toggle
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── authz.ts              # Authorization helpers (requireAuth, requireManager, ownership checks)
│   ├── prisma.ts             # Prisma client singleton
│   ├── domain.ts             # Domain enums (Role, OrderStatus, Priority, etc.)
│   ├── order-state.ts        # Status transition rules, labels
│   ├── jalali.ts             # Jalali date formatting/parsing utilities
│   ├── commission.ts         # Commission calculation logic
│   ├── utils.ts              # Shared helpers (formatting, naming, etc.)
│   └── queries/              # Server-side query functions
├── middleware.ts             # Auth protection for all routes except /login
└── types/
    └── next-auth.d.ts        # NextAuth type extensions
```

## Authentication and Authorization

- **Provider**: Credentials (username/password) with bcrypt password hashing
- **Session**: JWT strategy with `id` and `role` in token
- **Middleware**: Protects all routes except `/login`, `/api`, and static assets
- **Server Actions**: Each action validates session and permissions via `authz.ts`
- **Client Components**: Use `useSession()` from `next-auth/react` for role-based UI

### Permission Helpers (`src/lib/authz.ts`)

```typescript
// Require authenticated user (redirects to /login if not)
await requireAuth()

// Require manager role (throws if not ADMIN)
await requireManager()

// Check if user owns an order
await checkOrderOwnership(orderId, userId)

// Check order access (managers always allowed, employees only own orders)
await checkOrderAccess(orderId, userId, userRole)
```

## Order Ownership and Status Management

### Ownership Rules
- Every order has a `createdByUserId` linking to the creating user
- Employees can **view** all orders but only **edit/delete/change status** on their own orders
- Managers (ADMIN) have full access to all orders
- Enforcement happens in server actions (`src/app/actions/orders.ts`) via `checkOrderPermission`

### Status Transitions
The workflow enforces a logical progression:
```
NEW → REVIEWING → IN_PROGRESS → READY → DELIVERED
```
Side transitions allowed from most states:
- `ON_HOLD` (pause work)
- `NEEDS_REVISION` (send back for changes)
- `CANCELLED` (terminate)

From side states (ON_HOLD, NEEDS_REVISION, CANCELLED), only REVIEWING, IN_PROGRESS, or CANCELLED are allowed.

## Pagination, Loading Indicators, and Notifications

### Pagination
- Order list: 20 items per page (`PAGE_SIZE = 20` in `src/app/(dashboard)/orders/page.tsx`)
- URL-based pagination with `page` query parameter
- Preserves filter state across page changes

### Loading Overlay
- Global `LoadingProvider` in dashboard layout
- `useLoading()` hook provides `startLoading()` / `stopLoading()`
- Automatically shows full-screen spinner during server actions

### Toast Notifications
- Global `ToastProvider` in dashboard layout
- `useToast()` hook provides `showToast(type, message, duration?)`
- Types: `success`, `error`, `warning`, `info`
- Auto-dismiss after 5 seconds (configurable)

## Security Considerations

- Passwords hashed with bcrypt (cost factor 12)
- JWT sessions with HttpOnly cookies (NextAuth defaults)
- Server-side authorization checks on every mutating action
- CSRF protection via NextAuth callbacks
- Input validation with Zod schemas in server actions
- SQL injection prevention via Prisma parameterized queries
- Environment secrets never committed (`.env` in `.gitignore`)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format matches your provider
- For Neon/Supabase: ensure `sslmode=require` and correct host
- Run `npx prisma db pull` to verify connectivity

### Migration Errors
- `npx prisma migrate reset` to start fresh (development only)
- Check for pending migrations: `npx prisma migrate status`

### Authentication Problems
- Ensure `AUTH_SECRET` is set and consistent across deployments
- Verify `AUTH_URL` matches the actual origin (no trailing slash)
- Clear browser cookies if session issues persist

### Build Failures
- Run `npm run db:migrate` before `npm run build` (Prisma Client generation)
- Check TypeScript errors: `npx tsc --noEmit`

### Jalali Date Issues
- Ensure `date-fns-jalali` locale is loaded (`faIR`)
- Date inputs expect ISO strings; conversion happens in `jalali.ts` utilities

## License

This project is proprietary. All rights reserved.
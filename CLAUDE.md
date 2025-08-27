# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Warrior Babe v2 - A full-stack monorepo coaching/client management platform with authentication, team management, payment tracking, and comprehensive client relationship management.

## Prerequisites

- **Bun** is required (npm/yarn/pnpm are blocked via preinstall script)
- PostgreSQL database via Supabase
- Better Auth migrations must be run: `cd apps/web && npx @better-auth/cli migrate`

## Essential Commands

### Development
```bash
bun install          # Install dependencies
bun dev             # Start all apps (web on :3001, server on :3000)
bun dev:web         # Start only web app
bun dev:server      # Start only server
```

### Code Quality
```bash
bun check           # Run Biome formatter and linter with auto-fix
bun check-types     # Check TypeScript types across all apps
```

### Build
```bash
bun build           # Build all applications for production
```

### Database
```bash
bun db:push         # Push schema changes to database (runs from apps/server)
bun db:studio       # Open Drizzle Studio UI at localhost:4983
bun db:generate     # Generate Drizzle migrations
bun db:migrate      # Run Drizzle migrations
```

### Testing
No testing framework is currently configured. Tests need to be set up if required.

## Architecture

### Tech Stack
- **Runtime**: Bun (mandatory - npm/yarn/pnpm blocked)
- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, shadcn/ui
- **Backend**: Hono server with tRPC
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Auth**: Better Auth with email OTP and passkeys
- **Server Actions**: next-safe-action with Zod validation
- **Data Fetching**: TanStack Query with prefetching pattern
- **URL State**: nuqs for sharable state
- **Hooks**: @uidotdev/usehooks for common utilities
- **Forms**: TanStack Form with React Hook Form
- **Validation**: Zod schemas throughout
- **UI Components**: shadcn/ui built on Radix UI
- **Email**: React Email templates with Resend provider
- **Code Quality**: Biome (formatter/linter with custom Grit plugin), TypeScript strict mode

### Key Directories
- `apps/web/` - Next.js frontend application (port 3001)
  - `src/app/` - App Router pages
  - `src/components/` - Shared UI components
  - `src/features/` - Feature modules (ALL feature code goes here)
  - `src/lib/` - Core utilities and configs
  - `src/queries/` - Shared server queries
  - `src/utils/` - Utilities (query client, supabase client)
- `apps/server/` - Hono API server (port 3000)
  - `src/db/schema/` - Organized Drizzle schemas:
    - `clients/` - Client-related tables
    - `coach/` - Coach management tables
    - `goals/` - Goal categories and types
    - `payments/` - Payment system tables
    - `products/` - Product management
    - `system/` - System configurations
    - `wins/` - Client achievements
    - `common.ts` - Shared schema utilities
- `packages/emails/` - React Email templates

### Feature Folder Structure
All feature-related code MUST be organized in `/features/[feature-name]/`:
```
/features/[feature-name]/
├── actions/        # Server actions using next-safe-action
├── components/     # Feature-specific React components
├── queries/        # Data fetching (server queries & client hooks)
├── layout/         # Layout components (headers, etc.)
├── types/          # TypeScript types
└── data/           # Static data/mocks
```

## Development Patterns

### Page Pattern (React Query with Prefetching)
Follow this pattern from `apps/web/src/app/dashboard/coaches/page.tsx`:
```typescript
export default async function Page() {
  const queryClient = new QueryClient();
  
  // Get session once at page level
  const session = await getUser();
  
  // Prefetch all queries with Promise.all for parallel fetching
  await Promise.all([
    queryClient.prefetchQuery(featureQueries.query1()),
    queryClient.prefetchQuery(featureQueries.query2()),
    // ... more queries
  ]);
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainLayout>
        <ClientComponent />
      </MainLayout>
    </HydrationBoundary>
  );
}
```

### Server Actions Pattern
Use next-safe-action for all mutations:
```typescript
// In /features/[feature]/actions/createItem.ts
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export const createItem = actionClient
  .inputSchema(schema)
  .action(async ({ input }) => {
    // Action logic
  });
```

### Client Hooks Pattern
Use @uidotdev/usehooks for common utilities:
```typescript
import { useDebounce } from "@uidotdev/usehooks";
```

### URL State Management
Use nuqs for state that needs to be shareable via URL:
```typescript
import { useQueryState } from "nuqs";

// In component
const [filter, setFilter] = useQueryState("filter", {
  parse: (value) => JSON.parse(value),
  serialize: (value) => JSON.stringify(value),
});
```

### Important Files
- `apps/web/src/lib/safe-action.ts` - Server action client with auth middleware
- `apps/web/src/lib/auth-client.ts` - Better Auth client configuration
- `apps/web/src/lib/auth.ts` - Server-side auth utilities (getUser, authOptions)
- `apps/web/src/utils/supabase/client.ts` - Supabase client
- `apps/web/src/utils/queryClient.ts` - React Query configuration
- `apps/web/src/utils/supabase/database.types.ts` - Generated database types
- `apps/server/src/db/schema.ts` - Main Drizzle schema exports
- `apps/server/drizzle.config.ts` - Drizzle configuration
- `biome.json` - Code formatting/linting rules with custom Grit plugin
- `turbo.json` - Turborepo pipeline configuration
- `apps/web/components.json` - shadcn/ui configuration

## Development Guidelines

### Code Style (Biome Configuration)
- Tab indentation (enforced by Biome)
- Double quotes for strings
- Organized imports: React → Next.js → Node → external libs → internal
- Use `cn()` utility for className composition (supports `clsx`, `cva`)
- TailwindCSS class sorting enabled for `cn()`, `clsx()`, `cva()` functions
- Follow existing component patterns in `src/components/`
- No select components with value = ""
- Custom Grit plugin for object-assign patterns

### Type Safety
- All server actions use Zod schemas for validation
- Database types generated from Supabase
- Strict TypeScript configuration enabled

### Data Fetching
- Server components: Use server queries for prefetching
- Client components: Use React Query hooks
- Always prefetch data at page level using the HydrationBoundary pattern
- No need to get session in each page - do it once at the top level

### Environment Variables
- Copy `.env.example` to `.env.local` in both apps
- Required: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, Supabase keys
- Auth secrets: `BETTER_AUTH_SECRET`, email provider credentials

### Authentication (Better Auth)
- **Methods**: Email + Password (sign-up disabled), Email OTP, Passkeys
- **Email Provider**: Resend for OTP delivery
- **Session Management**: Cookie-based with 5-minute cache
- **Middleware**: Supabase RPC integration for user context
- **Admin Plugin**: Role-based access control enabled
- Session is fetched once at page level using `getUser()`
- Auth tables created via: `cd apps/web && npx @better-auth/cli migrate`

### Database (Drizzle ORM + Supabase)
- **Schema Pattern**: UUID primary keys with `defaultRandom()`, timestamps with `created_at`/`updated_at`
- **Enum Types**: Use proper enum types for status fields (e.g., ClientStatus, PaymentStatus)
- **Relations**: Properly defined foreign key relationships in schema
- Use Supabase client for all database operations
- Types are generated in `database.types.ts`
- Always use type-safe queries with proper joins
- For inputs, if database type is string, always use text input, and do not hallucinate on possible options
- If displaying linked record, never display id, but look up the appropriate name field

### Reusable Components
- Always use @universal-data-table for all data tables
- If data has foreign key relations to be displyed in the table, always lookup relevant user-friendly name field instead of displaying ID
- Always use <StatusBadge> for displaying status badges

### CRUD Development
- If asked to implement CRUD for certain feature, based off existing database types, add/edit forms and detail pages should absolutely always include every single possible field and relation outlined in the database, together with queries to fetch data from different tables if needed

### Detail Page Pattern
- When developing detail page for particular entity, always include all possible info from the database, including foreign key relations and junction tables.
- Parent level info should be shown on top (eg, if client has many brands, and we're on brand detail page, we should show client info on top)
- Children level info (opposite of parent level) should be sections above system info
- Children level info is always displayed with universal-data-table component with CRUD abilities there and all data from the database, except info about parent.
- If Children level info doesn't contain any pieces of data, display empty state - empty states should always be separate component
- Universal data table needs to have actions column with ability to delete that record
- in the section where you place universal data table, there always needs to be button that will trigger modal dialog from Base UI, that will then render component to add relevant records to the junction tables
- Break the page down into separate components, so each section is it's own component
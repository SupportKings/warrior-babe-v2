# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack monorepo application built with modern TypeScript tooling. It's a coaching/client management platform with authentication, team management, ticketing system, and financial tracking.

## Prerequisites

- **Bun** is required (npm/yarn/pnpm are blocked by .npmrc)
- PostgreSQL database via Supabase

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
bun check           # Run Biome formatter and linter
bun check-types     # Check TypeScript types across all apps
```

### Build
```bash
bun build           # Build all applications for production
```

## Architecture

### Tech Stack
- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Better Auth with email OTP and passkeys
- **Server Actions**: next-safe-action with Zod validation
- **Data Fetching**: TanStack Query with prefetching pattern
- **URL State**: nuqs for sharable state
- **Hooks**: @uidotdev/usehooks for common utilities
- **Styling**: TailwindCSS with custom design system

### Key Directories
- `apps/web/` - Next.js frontend application
  - `src/app/` - App Router pages
  - `src/components/` - Shared UI components
  - `src/features/` - Feature modules (ALL feature code goes here)
  - `src/lib/` - Core utilities and configs
  - `src/queries/` - Shared server queries
- `apps/server/` - Hono API server
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
- `apps/web/src/lib/safe-action.ts` - Server action client
- `apps/web/src/lib/auth-client.ts` - Auth client configuration
- `apps/web/src/lib/supabase/client.ts` - Supabase client
- `apps/web/src/utils/queryClient.ts` - React Query configuration
- `biome.json` - Code formatting/linting rules

## Development Guidelines

### Code Style
- Tab indentation (enforced by Biome)
- Double quotes for strings
- Use `cn()` utility for className composition
- Follow existing component patterns in `src/components/`

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

### Authentication
- Better Auth handles user sessions
- Session is fetched once at page level
- Permissions are passed down to components as needed

### Database
- Use Supabase client for all database operations
- Types are generated in `database.types.ts`
- Always use type-safe queries with proper joins
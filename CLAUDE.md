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
- No select components with value = ""

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
- For inputs, if database type is string, always use text input, and do not hallucinate on possible options (eg, if Status columns is text, do not try to figure out statuses)
- If displaying linked record, never display id, but look up the appropriate name

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
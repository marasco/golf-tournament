# Golf Tournament Leaderboard - Project Context

## Overview

This is a minimal golf tournament leaderboard application built with Next.js 15, Supabase, and Tailwind CSS. The design follows the Augusta Masters/Rolex aesthetic (green, gold, white theme).

## Architecture Decisions

### Why These Choices?

- **Next.js 15 App Router:** Server components by default for better performance, simpler data fetching
- **Supabase:** Provides PostgreSQL database + REST API with minimal setup, free tier sufficient
- **Basic Auth:** Simple username/password via middleware - adequate for single admin use case
- **No shadcn/ui:** Kept dependencies minimal, built only the UI components we need
- **Client-side calculations:** Net score (gross - handicap) computed in React components for simplicity
- **Service role key:** Admin API routes use service_role to bypass RLS for writes

### Key Patterns

1. **Server Components First:** All pages are server components except where client interactivity needed
2. **API Routes for Mutations:** Admin forms call `/admin/api/*` routes which use service_role key
3. **Public Read, Admin Write:** Supabase RLS allows public reads, writes require service_role
4. **No State Management Library:** React useState sufficient for admin forms

## Code Structure

```
app/
  page.tsx              → Public leaderboard (server component, fetches from Supabase)
  rules/page.tsx        → Static rules page
  admin/
    page.tsx            → Admin dashboard (client component, tabs UI)
    components/         → Player, Event, Score forms (client components)
    api/                → CRUD endpoints (use service_role key)

components/
  leaderboard-table.tsx → Main leaderboard logic (client for sorting)
  header.tsx            → Site navigation
  ui/                   → Minimal UI components (Button, Input, Select)

lib/
  supabase/
    server.ts           → Supabase client with service_role (for API routes)
    client.ts           → Supabase client with anon key (for public reads)
  types.ts              → TypeScript interfaces
  utils.ts              → cn() utility for className merging

middleware.ts           → Basic auth protection for /admin routes
```

## Important Implementation Details

### Leaderboard Calculation Logic

Located in `app/page.tsx` and `components/leaderboard-table.tsx`:

```typescript
// For each player:
// 1. Get all their scores
// 2. Calculate net per event: net = gross - handicap
// 3. Sum total gross and total net
// 4. Sort by total net (lowest wins)
```

### Authentication Flow

```
User visits /admin
  ↓
middleware.ts intercepts
  ↓
Checks Authorization header (basic auth)
  ↓
If valid → allow access
If invalid → 401 with WWW-Authenticate header
```

### API Routes Pattern

All admin API routes follow this pattern:

```typescript
// POST /admin/api/players/route.ts
export async function POST(request: Request) {
  const { name } = await request.json();
  const { data, error } = await supabaseServer
    .from("players")
    .insert({ name })
    .select()
    .single();
  return NextResponse.json(data);
}
```

### Database Schema

Three tables with cascade deletes:
- `players` (id, name, created_at)
- `events` (id, name, course_name, date, created_at)
- `scores` (id, player_id, event_id, handicap, gross_score, created_at)
  - UNIQUE(player_id, event_id) - one score per player per event

## Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe to expose)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (SECRET - bypasses RLS)
- `ADMIN_USER` - Admin username
- `ADMIN_PASSWORD` - Admin password

## Common Tasks

### Adding a New Field to Players

1. Update database schema (migration SQL)
2. Add field to `Player` interface in `lib/types.ts`
3. Update `PlayerForm` component to include input
4. Update API route to handle new field

### Changing Theme Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  augusta: {
    green: "#006241",
    gold: "#D4AF37",
    // ...
  }
}
```

### Adding a New Page

1. Create `app/new-page/page.tsx`
2. Add link in `components/header.tsx`
3. Follow existing patterns (server component by default)

## Things to Avoid

- **Don't use anon key for admin writes:** Always use service_role in admin API routes
- **Don't put service_role key in client code:** Only use in server-side code (API routes, server components)
- **Don't over-engineer:** This is intentionally minimal - resist adding unnecessary abstractions
- **Don't modify RLS policies without understanding:** Current setup is public read, admin write via service_role

## Testing Locally

```bash
# Install dependencies
npm install

# Set up .env.local with Supabase credentials
cp .env.local.example .env.local
# Edit .env.local with your values

# Run dev server
npm run dev

# Visit http://localhost:3000
# Admin: http://localhost:3000/admin (user: admin, pass: from .env.local)
```

## Deployment Notes

- Deploy to Vercel (auto-detects Next.js)
- Add all 5 environment variables in Vercel dashboard
- Database is on Supabase (separate from Vercel)
- Vercel handles builds, Supabase handles data
- See DEPLOYMENT.md for full guide

## Future Enhancement Ideas

If expanding this project, consider:
- Real-time updates (Supabase subscriptions)
- Multi-user auth (NextAuth.js or Supabase Auth)
- Player statistics/history pages
- Photo uploads for events
- PDF scorecard generation
- Email notifications for new scores
- Mobile app (React Native + same Supabase backend)

But remember: **the current implementation intentionally avoids these** to stay minimal and focused.

## Questions to Ask Before Making Changes

1. Does this align with the "minimal and elegant" goal?
2. Can this be done without adding new dependencies?
3. Is this feature essential for the core use case (tracking tournament scores)?
4. Will this make the codebase harder to understand?

If in doubt, prefer simplicity.

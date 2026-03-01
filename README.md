# Golf Tournament Leaderboard

A minimal, elegant golf tournament leaderboard website for tracking daily tournament scores. Built with Next.js 15, Supabase, and styled with the Augusta Masters/Rolex aesthetic.

## Features

- 🏌️ Public leaderboard displaying tournament standings
- 📊 Net score calculation (Gross - Handicap)
- 🔒 Admin dashboard with basic authentication
- 📱 Responsive design
- 🎨 Augusta Masters-inspired theme (green/gold/white)
- ⚡ Built with Next.js 15 App Router for optimal performance

## Tech Stack

- **Framework:** Next.js 15.2.4 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 3.4
- **Authentication:** Basic Auth via middleware
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd golf-leaderboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials (see Supabase Setup below).

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the leaderboard.

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for provisioning (2-3 minutes)

### 2. Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Verify tables in the **Table Editor**

### 3. Get API Keys

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 4. Update .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ADMIN_USER=admin
ADMIN_PASSWORD=your-secure-password
```

## Admin Dashboard

Access the admin dashboard at `/admin`. You'll be prompted for credentials (use the values from your `.env.local`).

### Managing Data

**Players Tab:**
- Add new players by entering their name
- Delete players (also deletes all their scores)

**Events Tab:**
- Create new tournament events with name, course, and date
- Delete events (also deletes all scores for that event)

**Scores Tab:**
- Enter scores by selecting player, event, handicap, and gross score
- Net score is automatically calculated (Gross - Handicap)
- Delete individual scores

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)

3. Click **Add New** → **Project**

4. Import your GitHub repository

5. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`

6. Click **Deploy**

7. Your site will be live at `https://your-project.vercel.app`

## Project Structure

```
golf-leaderboard/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Public leaderboard
│   ├── rules/page.tsx          # Rules page
│   └── admin/
│       ├── page.tsx            # Admin dashboard
│       └── components/         # Admin forms
├── components/
│   ├── leaderboard-table.tsx   # Main leaderboard component
│   ├── header.tsx              # Site header
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── supabase/               # Supabase clients
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── middleware.ts               # Basic auth protection
└── supabase/
    └── migrations/             # Database schema
```

## Leaderboard Logic

The leaderboard calculates:
- **Net Score** = Gross Score - Handicap
- **Total Net** = Sum of all net scores across events
- **Position** = Rank by lowest total net score

Lower scores are better. The player with the lowest total net score wins.

## Customization

### Change Theme Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  augusta: {
    green: "#006241",    // Your primary color
    gold: "#D4AF37",     // Your accent color
    white: "#FFFFFF",
  },
}
```

### Modify Rules

Edit `app/rules/page.tsx` to customize tournament rules.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - keep it secret!
- Use strong passwords for `ADMIN_PASSWORD`
- Basic Auth is suitable for single-admin use cases
- For multi-user auth, consider implementing NextAuth.js or Supabase Auth

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the code comments for implementation details

## License

MIT License - feel free to use this project for your tournaments!

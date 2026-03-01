# Quick Start Guide

## 🚀 30-Minute Deployment

### Step 1: Supabase (10 min)

1. Go to **supabase.com** → New Project
2. **SQL Editor** → New Query → Paste `supabase/migrations/001_initial_schema.sql` → Run
3. **Settings** → **API** → Copy these 3 values:
   ```
   Project URL: https://xxx.supabase.co
   anon public: eyJxxx...
   service_role: eyJxxx...
   ```

### Step 2: GitHub (5 min)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Vercel (15 min)

1. **vercel.com** → Import from GitHub
2. Add **5 environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL from Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public from Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role from Supabase
   - `ADMIN_USER` = admin
   - `ADMIN_PASSWORD` = your-strong-password
3. Deploy!

**Done!** Your site is live at `https://your-project.vercel.app`

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run dev server
npm run dev

# Open http://localhost:3000
```

**Admin:** http://localhost:3000/admin (login: admin / golfadmin123)

---

## 📁 Project Structure

```
app/
  page.tsx              → Public leaderboard
  rules/page.tsx        → Tournament rules
  admin/page.tsx        → Admin dashboard
  admin/api/            → CRUD endpoints

components/
  leaderboard-table.tsx → Leaderboard logic
  header.tsx            → Navigation
  ui/                   → Reusable components

lib/
  supabase/             → Database clients
  types.ts              → TypeScript types
```

---

## 🔑 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_USER=admin
ADMIN_PASSWORD=your-secure-password
```

---

## ✅ Testing Checklist

After deployment:
1. Visit your Vercel URL
2. See empty leaderboard ✓
3. Go to `/admin` ✓
4. Login with credentials ✓
5. Create a player ✓
6. Create an event ✓
7. Create a score ✓
8. View leaderboard - see the score ✓

---

## 🎨 Theme Colors

Edit `tailwind.config.ts`:

```typescript
augusta: {
  green: "#006241",   // Primary color
  gold: "#D4AF37",    // Accent color
}
```

---

## 🛠 Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Check code quality
```

---

## 📊 Database Tables

- **players** → id, name
- **events** → id, name, course_name, date
- **scores** → id, player_id, event_id, handicap, gross_score

**Leaderboard logic:** Net Score = Gross - Handicap (lower wins)

---

## 🔒 Admin Routes

Protected by basic auth (middleware.ts):

- `/admin` → Dashboard
- `/admin/api/*` → CRUD operations

---

## 📖 Full Documentation

- **README.md** → Complete guide
- **DEPLOYMENT.md** → Detailed deployment steps
- **CLAUDE.md** → Project architecture & context
- **IMPLEMENTATION_SUMMARY.md** → What was built

---

## 🆘 Troubleshooting

**Build fails?**
- Check all 5 environment variables are set
- Run `npm install` to ensure dependencies are installed

**Admin login doesn't work?**
- Verify `ADMIN_USER` and `ADMIN_PASSWORD` in Vercel
- Clear browser cache

**Can't create scores?**
- Check `SUPABASE_SERVICE_ROLE_KEY` (not anon key!)
- Verify Supabase migration ran successfully

**"Table does not exist"?**
- Re-run migration in Supabase SQL Editor

---

## 🎯 URLs

- **Public:** `/`
- **Rules:** `/rules`
- **Admin:** `/admin`

---

## 🎉 You're Ready!

The project is **production-ready**. Just follow the 3 deployment steps above and you'll have a live golf tournament leaderboard in 30 minutes.

Need help? Check the full docs in `README.md` and `DEPLOYMENT.md`.

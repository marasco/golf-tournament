# Deployment Guide

This guide walks you through deploying the Golf Tournament Leaderboard to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name:** golf-leaderboard
   - **Database Password:** (generate a strong password)
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 1.2 Run Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from your project
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see: "Success. No rows returned"

### 1.3 Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - `players`
   - `events`
   - `scores`

### 1.4 Get API Keys

1. Go to **Settings** > **API** (gear icon in sidebar)
2. Scroll to "Project API keys"
3. Copy these values (you'll need them later):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGci....(very long string)
service_role key: eyJhbGci....(very long string - keep secret!)
```

**Important:** The `service_role` key bypasses Row Level Security. Never commit it to git or expose it in client-side code!

## Step 2: GitHub Setup

### 2.1 Initialize Git Repository

```bash
cd golf-leaderboard
git init
git add .
git commit -m "Initial commit - Golf Leaderboard"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name:** golf-leaderboard
   - **Visibility:** Private or Public (your choice)
   - **DO NOT** initialize with README (we already have one)
3. Click "Create repository"

### 2.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/golf-leaderboard.git
git branch -M main
git push -u origin main
```

## Step 3: Vercel Deployment

### 3.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository:
   - Click "Import" next to `golf-leaderboard`
   - If not visible, click "Adjust GitHub App Permissions" and grant access

### 3.2 Configure Project

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `./` (default)
3. **Build Command:** `next build` (default)
4. **Output Directory:** `.next` (default)

### 3.3 Add Environment Variables

Click **Environment Variables** and add the following:

| Name | Value | Where to find |
|------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... | Supabase → Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... | Supabase → Settings → API (service_role - secret!) |
| `ADMIN_USER` | admin | Your chosen admin username |
| `ADMIN_PASSWORD` | your-secure-password | Your chosen admin password |

**Tips:**
- Use a strong password for `ADMIN_PASSWORD` (e.g., generate with password manager)
- Triple-check you're using the `service_role` key, not the `anon` key
- All 5 variables must be added for the app to work

### 3.4 Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll see: "Congratulations! Your project is live!"
4. Click "Visit" to see your deployed site

## Step 4: Verify Deployment

### 4.1 Test Public Leaderboard

1. Visit your Vercel URL (e.g., `https://golf-leaderboard.vercel.app`)
2. You should see:
   - Header with "Golf Tournament"
   - Navigation links (Leaderboard, Rules)
   - "No scores available yet" message
   - Footer

### 4.2 Test Admin Dashboard

1. Go to `/admin` (e.g., `https://golf-leaderboard.vercel.app/admin`)
2. You should see a browser login prompt
3. Enter:
   - **Username:** (your `ADMIN_USER` value)
   - **Password:** (your `ADMIN_PASSWORD` value)
4. You should see the admin dashboard with three tabs:
   - Players
   - Events
   - Scores

### 4.3 Test CRUD Operations

**Add a Player:**
1. In admin dashboard, stay on "Players" tab
2. Enter a player name (e.g., "John Smith")
3. Click "Add Player"
4. Player should appear in the list below

**Add an Event:**
1. Click "Events" tab
2. Fill in:
   - Event name: "Spring Championship"
   - Course name: "Pebble Beach"
   - Date: Select today's date
3. Click "Add Event"
4. Event should appear in the list

**Add a Score:**
1. Click "Scores" tab
2. Fill in:
   - Select Player: "John Smith"
   - Select Event: "Spring Championship"
   - Handicap: 10
   - Gross Score: 85
3. Click "Add Score"
4. Score should appear (with Net: 75)

**View Leaderboard:**
1. Click "Leaderboard" in header
2. You should see John Smith with his score displayed
3. Net score should be 75 (85 - 10)

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `golf.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### 5.2 Update DNS

Add the following DNS records in your domain provider:

**For subdomain (recommended):**
```
Type: CNAME
Name: golf
Value: cname.vercel-dns.com
```

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

## Troubleshooting

### Issue: "Database connection failed"

**Solution:** Check environment variables in Vercel:
1. Go to Vercel → Project → Settings → Environment Variables
2. Verify all 5 variables are set correctly
3. Redeploy: Vercel → Deployments → ⋯ → Redeploy

### Issue: "Admin login not working"

**Solution:** Verify credentials:
1. Check `ADMIN_USER` and `ADMIN_PASSWORD` in Vercel settings
2. Try clearing browser cache/cookies
3. Use incognito/private browsing mode

### Issue: "Failed to create player/event/score"

**Solution:** Verify service_role key:
1. Go to Supabase → Settings → API
2. Copy the **service_role** key (not anon key!)
3. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel
4. Redeploy

### Issue: "Table does not exist"

**Solution:** Re-run migration:
1. Go to Supabase → SQL Editor
2. Run the migration from `supabase/migrations/001_initial_schema.sql`
3. Verify tables in Table Editor

### Issue: Build fails in Vercel

**Solution:** Check build logs:
1. Vercel → Deployments → Click failed deployment
2. Scroll to error message
3. Common issues:
   - TypeScript errors: Fix locally and push
   - Missing dependencies: Run `npm install` locally
   - Environment variables: Add in Vercel settings

## Post-Deployment

### Security Checklist

- [ ] Admin password is strong (12+ characters, mixed case, numbers, symbols)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in Vercel (not in git)
- [ ] `.env.local` is in `.gitignore`
- [ ] GitHub repository is private (if containing sensitive info)

### Optional Enhancements

- Set up Vercel Analytics for traffic insights
- Configure Vercel Cron Jobs for automated tasks
- Enable Vercel Web Analytics
- Set up uptime monitoring (e.g., UptimeRobot)

## Updating the App

When you make code changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically:
1. Detect the push to GitHub
2. Build the new version
3. Deploy to production
4. Keep the old version running until new one is ready (zero downtime)

## Need Help?

- **Next.js Issues:** https://nextjs.org/docs
- **Supabase Issues:** https://supabase.com/docs
- **Vercel Issues:** https://vercel.com/docs

## Success!

Your Golf Tournament Leaderboard is now live! Share the URL with tournament participants and start tracking scores.

**Default URLs:**
- Public Leaderboard: `https://your-project.vercel.app/`
- Rules Page: `https://your-project.vercel.app/rules`
- Admin Dashboard: `https://your-project.vercel.app/admin`

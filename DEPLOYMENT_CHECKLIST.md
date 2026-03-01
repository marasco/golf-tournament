# Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment

### Local Verification
- [ ] Project builds successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Development server runs: `npm run dev`
- [ ] All pages load correctly in browser

### Code Repository
- [ ] Git initialized: `git init`
- [ ] All files committed: `git add . && git commit -m "Initial commit"`
- [ ] GitHub repository created
- [ ] Code pushed to GitHub: `git push -u origin main`

## Supabase Setup

### Create Project
- [ ] Signed up at supabase.com
- [ ] Created new project named "golf-leaderboard"
- [ ] Waited for provisioning (2-3 minutes)

### Database Migration
- [ ] Opened SQL Editor in Supabase
- [ ] Created new query
- [ ] Pasted contents of `supabase/migrations/001_initial_schema.sql`
- [ ] Ran query successfully (no errors)
- [ ] Verified tables exist in Table Editor:
  - [ ] `players` table exists
  - [ ] `events` table exists
  - [ ] `scores` table exists

### API Keys
- [ ] Opened Settings → API in Supabase
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Copied service_role key (kept secret!)

## Vercel Deployment

### Import Project
- [ ] Signed up/logged in at vercel.com
- [ ] Clicked "Add New" → "Project"
- [ ] Imported GitHub repository
- [ ] Framework preset detected as Next.js

### Environment Variables
Added all 5 variables (case-sensitive):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Supabase service_role key
- [ ] `ADMIN_USER` = admin (or your chosen username)
- [ ] `ADMIN_PASSWORD` = strong password (12+ characters)

### Deploy
- [ ] Clicked "Deploy" button
- [ ] Waited for build to complete (2-3 minutes)
- [ ] Deployment successful (no errors)

## Post-Deployment Testing

### Public Pages
- [ ] Visit production URL
- [ ] Homepage loads correctly
- [ ] Shows "No scores available yet" message
- [ ] Header displays "Golf Tournament"
- [ ] Navigation links work (Leaderboard, Rules)
- [ ] Rules page loads and displays correctly
- [ ] Footer shows copyright
- [ ] Mobile responsive (test on phone or resize browser)

### Admin Access
- [ ] Navigate to `/admin` route
- [ ] Browser prompts for username/password
- [ ] Login successful with credentials from env vars
- [ ] Admin dashboard loads
- [ ] Three tabs visible: Players, Events, Scores

### CRUD Operations

#### Players
- [ ] Can add a new player (e.g., "John Smith")
- [ ] Player appears in list immediately
- [ ] Can delete the player
- [ ] Player removed from list

#### Events
- [ ] Can create a new event
  - [ ] Event name: "Spring Championship"
  - [ ] Course: "Pebble Beach"
  - [ ] Date: Today's date
- [ ] Event appears in list
- [ ] Can delete the event
- [ ] Event removed from list

#### Scores
- [ ] Recreate player and event (if deleted above)
- [ ] Can create a new score:
  - [ ] Select player: "John Smith"
  - [ ] Select event: "Spring Championship"
  - [ ] Handicap: 10
  - [ ] Gross: 85
- [ ] Score appears in list
- [ ] Net score calculated correctly (75 = 85 - 10)
- [ ] Can delete the score
- [ ] Score removed from list

### Leaderboard Display
- [ ] Create test data:
  - [ ] 2 players
  - [ ] 1 event
  - [ ] 2 scores (one for each player)
- [ ] Navigate to homepage (/)
- [ ] Leaderboard displays both players
- [ ] Scores shown correctly
- [ ] Net scores calculated correctly
- [ ] Position/rank shown
- [ ] Can click column headers to sort
- [ ] Top 3 have gold highlighting

### Data Persistence
- [ ] Refresh browser
- [ ] All data still present
- [ ] No data lost
- [ ] Check Supabase Table Editor - data visible there too

## Security Verification

### Authentication
- [ ] Cannot access `/admin` without login
- [ ] Browser prompts for credentials
- [ ] Wrong password shows "Invalid credentials"
- [ ] Correct password grants access

### Database Access
- [ ] Public pages work (don't need auth)
- [ ] Admin API routes require authentication
- [ ] Service role key only used server-side (not in client code)
- [ ] .env files not committed to git

### SSL/HTTPS
- [ ] Production URL uses HTTPS (padlock icon in browser)
- [ ] No mixed content warnings
- [ ] Certificate valid

## Performance

### Load Times
- [ ] Homepage loads in < 2 seconds
- [ ] Admin dashboard loads in < 3 seconds
- [ ] No console errors in browser DevTools
- [ ] No 404 errors for assets

### Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsive Design
Test at different screen sizes:
- [ ] Desktop (1920px)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## Optional Enhancements

### Custom Domain (Optional)
- [ ] Domain purchased/available
- [ ] Added to Vercel project
- [ ] DNS configured (CNAME or A record)
- [ ] SSL certificate provisioned
- [ ] Custom domain working

### Monitoring (Optional)
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Error tracking configured (e.g., Sentry)

## Documentation

### Team Access
- [ ] Shared production URL with team
- [ ] Shared admin credentials securely (password manager)
- [ ] Shared Supabase dashboard access (if needed)
- [ ] Shared Vercel dashboard access (if needed)

### Backup Information
Documented and stored securely:
- [ ] Supabase Project URL
- [ ] Supabase Database Password
- [ ] Vercel Project URL
- [ ] Admin credentials
- [ ] GitHub repository URL

## Troubleshooting

If issues arise, check:
- [ ] Vercel deployment logs (Deployments tab)
- [ ] Browser console for JavaScript errors
- [ ] Network tab for failed API calls
- [ ] Supabase logs (if available)
- [ ] Environment variables are all set correctly
- [ ] Service role key is correct (not anon key)

## Success!

When all items are checked:
- ✅ Your Golf Tournament Leaderboard is LIVE
- ✅ Admin can manage players, events, and scores
- ✅ Public can view the leaderboard
- ✅ Data is secure and persistent
- ✅ Site is fast and responsive

## Next Steps

Now you can:
1. **Add real data** - Create your actual players and events
2. **Customize rules** - Edit `app/rules/page.tsx`
3. **Change theme** - Modify colors in `tailwind.config.ts`
4. **Share URL** - Send to tournament participants
5. **Monitor usage** - Check Vercel Analytics

---

## Need Help?

- Check `README.md` for general documentation
- Check `DEPLOYMENT.md` for detailed deployment steps
- Check `QUICK_START.md` for quick reference
- Check Vercel deployment logs for build errors
- Check browser console for runtime errors

---

**Deployment Date:** _____________

**Production URL:** _____________________________________________

**Admin Credentials:**
- Username: _____________
- Password: _____________ (stored in password manager)

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

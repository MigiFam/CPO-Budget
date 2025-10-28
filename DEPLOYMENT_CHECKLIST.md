# Vercel Deployment Checklist

## Pre-Deployment

### 1. Code Preparation
- [ ] All changes committed to Git
- [ ] No TypeScript errors: `npm run lint`
- [ ] Build works locally: `npm run build`
- [ ] `.env` files not committed (check `.gitignore`)

### 2. Database Setup
Choose one database provider:

**Option A: Neon (Recommended)**
- [ ] Create account at https://neon.tech
- [ ] Create new project
- [ ] Copy connection string
- [ ] Test connection locally

**Option B: Supabase**
- [ ] Create account at https://supabase.com  
- [ ] Create new project
- [ ] Copy connection pooler string
- [ ] Test connection locally

**Option C: Vercel Postgres**
- [ ] Will be set up in Vercel dashboard
- [ ] Skip to deployment section

### 3. Environment Variables Preparation

Create a `.env.production` file (DO NOT COMMIT):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# API
NODE_ENV=production
API_PORT=3001
JWT_SECRET=<generate-32-char-secret>
CORS_ORIGIN=https://your-app.vercel.app

# Optional
VITE_DATA_MODE=demo
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the repository

### Step 3: Configure Project Settings

**Framework Preset**: Other (or Vite)

**Root Directory**: `./`

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `apps/web/dist`  
- Install Command: `npm install`

### Step 4: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

Add each variable for **Production**, **Preview**, and **Development**:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | 32+ character secret | Generated above |
| `CORS_ORIGIN` | Your Vercel app URL | Will update after first deploy |
| `NODE_ENV` | `production` | `production` |
| `API_PORT` | `3001` | `3001` |

### Step 5: Deploy
- Click "Deploy"
- Wait 3-5 minutes for build
- Note your deployment URL: `https://your-app-xxx.vercel.app`

### Step 6: Update CORS Origin
1. Copy your actual Vercel URL
2. Go to Settings → Environment Variables
3. Update `CORS_ORIGIN` to: `https://your-actual-app.vercel.app`
4. Redeploy: Deployments → Three dots → Redeploy

### Step 7: Run Database Migrations

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy --schema=./apps/api/prisma/schema.prisma

# Seed database (optional)
npm run db:seed -w apps/api
```

**Option B: Using Direct Connection**
```bash
# Set DATABASE_URL from Vercel
export DATABASE_URL="your-production-database-url"

# Run migrations
cd apps/api
npx prisma migrate deploy

# Seed database
npm run db:seed
```

## Post-Deployment Verification

### Test Checklist
- [ ] Visit: `https://your-app.vercel.app`
- [ ] Homepage loads correctly
- [ ] API health check: `https://your-app.vercel.app/api/health`
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Projects page works
- [ ] Can create/edit projects
- [ ] Budget breakdown works
- [ ] No CORS errors in console

### Common Issues

**Build Fails**
- Check build logs in Vercel dashboard
- Run `npm run build` locally to debug
- Verify all dependencies in package.json

**Database Connection Error**
- Verify DATABASE_URL is correct
- Check SSL mode: add `?sslmode=require`
- Verify database allows connections from Vercel

**CORS Errors**
- Verify CORS_ORIGIN matches exactly
- Must include `https://`
- Redeploy after changing env vars

**404 on API Routes**
- Check vercel.json routing
- Verify build output in Deployments → Source
- Check function logs

**White Screen**
- Check browser console for errors
- Verify VITE env vars start with `VITE_`
- Check if API URL is correct

## Custom Domain (Optional)

### Add Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `budget.yourdomain.com`)
3. Update DNS records:
   - Type: `A` or `CNAME`
   - Value: Provided by Vercel
4. Wait for DNS propagation (5-60 minutes)
5. Update `CORS_ORIGIN` to custom domain
6. Redeploy

## Monitoring

### View Logs
```bash
vercel logs --follow
```

Or in dashboard: Deployments → Your deployment → Runtime Logs

### Performance Monitoring
- Vercel Dashboard → Analytics
- View response times, errors, traffic

## Continuous Deployment

Once set up:
- **Production**: Auto-deploys from `main` branch
- **Preview**: Auto-deploys from PRs and branches
- Can disable in Settings → Git

## Rollback

If deployment has issues:

1. Go to Deployments
2. Find previous working deployment
3. Click three dots → Promote to Production

Or via CLI:
```bash
vercel rollback
```

## Cost Estimate

### Hobby Plan (Free)
✅ Perfect for testing/small teams
- 100 GB bandwidth/month
- Serverless functions
- Automatic SSL
- Edge network

### Pro Plan ($20/month)
✅ Recommended for production
- 1 TB bandwidth
- Priority builds
- Advanced analytics
- Team features
- Custom domains

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] CORS restricted to your domain
- [ ] DATABASE_URL uses SSL
- [ ] No secrets in code
- [ ] Environment variables in Vercel only
- [ ] Database backups enabled
- [ ] Monitor logs regularly

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Prisma Docs**: https://www.prisma.io/docs
- **Your Logs**: `vercel logs`

## Quick Reference

```bash
# Deploy
vercel --prod

# View logs
vercel logs

# Pull env vars
vercel env pull

# List deployments
vercel ls

# Rollback
vercel rollback

# Open dashboard
vercel

# Remove project
vercel remove [project-name]
```

---

## Status Tracker

- [ ] Database created
- [ ] Environment variables set
- [ ] Code deployed
- [ ] Migrations run
- [ ] Database seeded
- [ ] Tests passed
- [ ] CORS configured
- [ ] Custom domain added (if applicable)
- [ ] Monitoring enabled

**Deployment Date**: _____________

**Live URL**: _____________

**Database Provider**: _____________

**Notes**: _____________________________________________

---

✅ **You're ready to deploy!** Follow each step carefully and check them off as you go.

# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally: `npm i -g vercel`
3. **PostgreSQL Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)

## Environment Variables Setup

### Required Environment Variables

You need to set these in Vercel dashboard (Settings → Environment Variables):

#### Database
```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

#### API Configuration
```bash
API_PORT=3001
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here-min-32-chars
CORS_ORIGIN=https://your-app.vercel.app
```

#### Optional (for demo mode)
```bash
VITE_DATA_MODE=demo
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select "CPO budget app" repository

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - In project settings, add all required environment variables listed above
   - Make sure to add `DATABASE_URL` with your PostgreSQL connection string

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)

### Option 2: Deploy via CLI

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add CORS_ORIGIN
   ```

4. **Deploy**
   ```bash
   # Deploy to preview
   vercel
   
   # Deploy to production
   vercel --prod
   ```

## Database Setup

### Option 1: Neon (Recommended - Free tier available)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel as `DATABASE_URL`

### Option 2: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Connection pooling)
5. Add to Vercel as `DATABASE_URL`

### Option 3: Vercel Postgres

1. In Vercel dashboard, go to Storage
2. Create new Postgres database
3. It will automatically set `DATABASE_URL`

### Run Migrations

After database is set up, run migrations:

```bash
# Set the DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:migrate -w apps/api

# Seed database (optional)
npm run db:seed -w apps/api
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npm run db:migrate -w apps/api
```

## Post-Deployment Steps

### 1. Update CORS Origin

In Vercel dashboard, update `CORS_ORIGIN` environment variable:
```bash
CORS_ORIGIN=https://your-actual-domain.vercel.app
```

### 2. Test the Deployment

Visit your deployed app:
- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`

### 3. Set Up Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CORS_ORIGIN` to your custom domain

## Troubleshooting

### Build Fails

**Error: Cannot find module**
- Make sure all dependencies are in `package.json`
- Try: `npm install` locally to verify

**TypeScript errors**
- Run `npm run lint` locally to check for errors
- Fix any TypeScript errors before deploying

### Database Connection Issues

**Error: Connection refused**
- Check `DATABASE_URL` is correct
- Verify database allows connections from Vercel IPs
- For Neon/Supabase: Enable connection pooling

**Error: SSL required**
- Add `?sslmode=require` to end of DATABASE_URL
- Example: `postgresql://user:pass@host/db?sslmode=require`

### CORS Errors

- Verify `CORS_ORIGIN` matches your Vercel domain exactly
- Include protocol: `https://` not just domain name
- Redeploy after changing environment variables

### API Routes Not Working

**404 on /api/...**
- Check `vercel.json` routing configuration
- Verify API routes are built correctly
- Check build logs for errors

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secure random string (32+ characters)
- [ ] `CORS_ORIGIN` - Your Vercel app URL
- [ ] `NODE_ENV` - Set to "production"
- [ ] Database migrations run
- [ ] Seed data loaded (if needed)

## Monitoring

### Check Logs

```bash
vercel logs
```

Or view in Vercel dashboard → Deployments → Click deployment → Function logs

### Performance

Vercel provides automatic:
- CDN for static assets
- Edge caching
- SSL certificates
- DDoS protection

## Continuous Deployment

Once set up, Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

Disable auto-deploy in Settings → Git if needed.

## Cost Considerations

### Free Tier Limits (Hobby Plan)
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Unlimited deployments
- 1 concurrent build

### Pro Plan ($20/month)
- 1 TB bandwidth/month
- Unlimited build minutes
- 12 concurrent builds
- Custom domains
- Team collaboration

For production use with multiple users, Pro plan recommended.

## Security Recommendations

1. **Use strong JWT_SECRET**: Generate with `openssl rand -base64 32`
2. **Restrict CORS**: Set specific domain, not `*`
3. **Enable SSL**: Vercel provides automatic SSL
4. **Use environment variables**: Never commit secrets
5. **Database backups**: Enable on Neon/Supabase
6. **Monitor logs**: Check for suspicious activity

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Neon Documentation](https://neon.tech/docs)

## Quick Commands Reference

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

---

**Ready to Deploy!** Follow the steps above and your CPO Budget App will be live on Vercel in minutes.

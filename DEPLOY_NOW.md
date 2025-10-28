# 🚀 Ready to Deploy to Vercel!

Your CPO Budget App is ready for deployment. Follow the steps below.

## Quick Start (5 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Run Deployment Script
**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will guide you through:
- ✅ Build verification
- ✅ Database setup check
- ✅ Environment variables check
- ✅ Git commit and push
- ✅ Vercel deployment

## Manual Deployment

### Option 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure build settings (see below)

3. **Build Configuration**
   - Framework: Vite (or Other)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `apps/web/dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   
   Go to Settings → Environment Variables and add:
   
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` (update after first deploy) |
   | `NODE_ENV` | `production` |

5. **Deploy!**
   - Click "Deploy"
   - Wait 3-5 minutes

### Option 2: Vercel CLI

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

## Database Setup

Choose one provider:

### Neon (Recommended - Free Tier)
1. Create account: https://neon.tech
2. Create project
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`

### Supabase
1. Create account: https://supabase.com
2. Create project  
3. Get connection pooler URL
4. Add to Vercel as `DATABASE_URL`

### Vercel Postgres
1. In Vercel dashboard → Storage
2. Create Postgres database
3. Auto-sets `DATABASE_URL`

## Run Database Migrations

After deployment:

```bash
# Pull environment variables
vercel env pull .env.production

# Run migrations
cd apps/api
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

## Post-Deployment

1. **Test Your App**
   - Visit: `https://your-app.vercel.app`
   - Check API: `https://your-app.vercel.app/api/health`
   - Login and test features

2. **Update CORS**
   - Copy your Vercel URL
   - Update `CORS_ORIGIN` in Vercel dashboard
   - Redeploy

3. **Monitor**
   ```bash
   vercel logs --follow
   ```

## Files Created for Deployment

✅ `vercel.json` - Vercel configuration
✅ `DEPLOYMENT_CHECKLIST.md` - Detailed step-by-step guide
✅ `VERCEL_DEPLOYMENT.md` - Complete deployment documentation
✅ `deploy.sh` - Automated deployment script (Mac/Linux)
✅ `deploy.ps1` - Automated deployment script (Windows)
✅ `.env.example` - Environment variables template

## Troubleshooting

### Build Fails
- Run `npm run build` locally
- Check build logs in Vercel
- Verify all dependencies

### Database Connection Error
- Check `DATABASE_URL` format
- Add `?sslmode=require` for SSL
- Verify database allows Vercel IPs

### CORS Error
- Verify `CORS_ORIGIN` matches URL exactly
- Must include `https://`
- Redeploy after env var changes

### API 404
- Check `vercel.json` routing
- Verify build output
- Check function logs

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string with SSL
- `JWT_SECRET` - 32+ character random string
- `CORS_ORIGIN` - Your Vercel URL with https://
- `NODE_ENV` - Set to "production"

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Cost

### Free (Hobby)
- ✅ 100 GB bandwidth/month
- ✅ Perfect for testing
- ✅ Automatic SSL
- ✅ Edge network

### Pro ($20/month)
- ✅ 1 TB bandwidth
- ✅ Priority builds
- ✅ Analytics
- ✅ Team features

## Support

- 📖 **Full Guide**: `DEPLOYMENT_CHECKLIST.md`
- 📖 **Vercel Docs**: https://vercel.com/docs
- 💬 **Community**: https://github.com/vercel/vercel/discussions

## Quick Commands

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
```

---

## ✅ Pre-Flight Checklist

Before deploying, ensure:

- [ ] Code builds locally: `npm run build`
- [ ] Database is created (Neon/Supabase/Vercel)
- [ ] Environment variables prepared
- [ ] `.env` not committed (check .gitignore)
- [ ] Latest code pushed to GitHub
- [ ] JWT_SECRET generated
- [ ] CORS_ORIGIN ready to update

---

## 🎉 You're Ready!

Run the deployment script or follow the manual steps above.

**Estimated Time**: 10-15 minutes for first deployment

**Questions?** See `DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting.

Good luck! 🚀

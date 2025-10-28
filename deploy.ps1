# Vercel Deployment Quick Start Script (PowerShell)
# This script helps you deploy to Vercel step by step

Write-Host "🚀 CPO Budget App - Vercel Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    Write-Host ""
}

# Step 1: Build Check
Write-Host "Step 1: Checking if build works locally..." -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Database Setup
Write-Host "Step 2: Database Setup" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
Write-Host "Have you set up your PostgreSQL database?"
Write-Host "Options:"
Write-Host "  1. Neon (https://neon.tech) - Recommended"
Write-Host "  2. Supabase (https://supabase.com)"
Write-Host "  3. Vercel Postgres (in Vercel dashboard)"
Write-Host ""
$databaseSetup = Read-Host "Have you set up a database? (y/n)"

if ($databaseSetup -ne "y") {
    Write-Host "⚠️  Please set up a database first. See DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 3: Environment Variables
Write-Host "Step 3: Environment Variables" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan
Write-Host "Required environment variables:"
Write-Host "  - DATABASE_URL"
Write-Host "  - JWT_SECRET"
Write-Host "  - CORS_ORIGIN"
Write-Host "  - NODE_ENV"
Write-Host ""
Write-Host "Generate JWT_SECRET with:" -ForegroundColor Yellow
Write-Host "  node -e `"console.log(require('crypto').randomBytes(32).toString('hex'))`"" -ForegroundColor Yellow
Write-Host ""
$envReady = Read-Host "Do you have all environment variables ready? (y/n)"

if ($envReady -ne "y") {
    Write-Host "⚠️  Please prepare your environment variables. See DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 4: Git Check
Write-Host "Step 4: Checking Git status..." -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes" -ForegroundColor Yellow
    Write-Host ""
    git status --short
    Write-Host ""
    $commitNow = Read-Host "Commit changes now? (y/n)"
    
    if ($commitNow -eq "y") {
        $commitMessage = Read-Host "Enter commit message"
        git add .
        git commit -m $commitMessage
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Continuing with uncommitted changes..." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}
Write-Host ""

# Step 5: Push to GitHub
Write-Host "Step 5: Push to GitHub" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan
$pushGithub = Read-Host "Push to GitHub? (y/n)"

if ($pushGithub -eq "y") {
    git push
    Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
}
Write-Host ""

# Step 6: Deploy
Write-Host "Step 6: Deploy to Vercel" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
Write-Host "Choose deployment type:"
Write-Host "  1. Preview (test deployment)"
Write-Host "  2. Production"
$deployType = Read-Host "Enter choice (1 or 2)"

switch ($deployType) {
    "1" {
        Write-Host "🚀 Deploying preview..." -ForegroundColor Cyan
        vercel
    }
    "2" {
        Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
        vercel --prod
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait for deployment to complete (3-5 minutes)"
Write-Host "2. Copy your deployment URL"
Write-Host "3. Update CORS_ORIGIN in Vercel dashboard"
Write-Host "4. Run database migrations (see DEPLOYMENT_CHECKLIST.md)"
Write-Host "5. Test your deployed app"
Write-Host ""
Write-Host "View logs with: vercel logs" -ForegroundColor Cyan
Write-Host "See full guide: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Happy deploying!" -ForegroundColor Green

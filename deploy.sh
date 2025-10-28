#!/bin/bash

# Vercel Deployment Quick Start Script
# This script helps you deploy to Vercel step by step

set -e

echo "🚀 CPO Budget App - Vercel Deployment"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
    echo ""
fi

# Step 1: Build Check
echo "Step 1: Checking if build works locally..."
echo "-------------------------------------------"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi
echo ""

# Step 2: Database Setup
echo "Step 2: Database Setup"
echo "----------------------"
echo "Have you set up your PostgreSQL database?"
echo "Options:"
echo "  1. Neon (https://neon.tech) - Recommended"
echo "  2. Supabase (https://supabase.com)"
echo "  3. Vercel Postgres (in Vercel dashboard)"
echo ""
read -p "Have you set up a database? (y/n): " database_setup

if [ "$database_setup" != "y" ]; then
    echo "⚠️  Please set up a database first. See DEPLOYMENT_CHECKLIST.md"
    exit 1
fi
echo ""

# Step 3: Environment Variables
echo "Step 3: Environment Variables"
echo "-----------------------------"
echo "Required environment variables:"
echo "  - DATABASE_URL"
echo "  - JWT_SECRET"
echo "  - CORS_ORIGIN"
echo "  - NODE_ENV"
echo ""
echo "Generate JWT_SECRET with:"
echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""
read -p "Do you have all environment variables ready? (y/n): " env_ready

if [ "$env_ready" != "y" ]; then
    echo "⚠️  Please prepare your environment variables. See DEPLOYMENT_CHECKLIST.md"
    exit 1
fi
echo ""

# Step 4: Git Check
echo "Step 4: Checking Git status..."
echo "------------------------------"
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes"
    echo ""
    git status --short
    echo ""
    read -p "Commit changes now? (y/n): " commit_now
    
    if [ "$commit_now" = "y" ]; then
        echo "Enter commit message:"
        read commit_message
        git add .
        git commit -m "$commit_message"
        echo "✅ Changes committed"
    else
        echo "⚠️  Continuing with uncommitted changes..."
    fi
else
    echo "✅ No uncommitted changes"
fi
echo ""

# Step 5: Push to GitHub
echo "Step 5: Push to GitHub"
echo "----------------------"
read -p "Push to GitHub? (y/n): " push_github

if [ "$push_github" = "y" ]; then
    git push
    echo "✅ Pushed to GitHub"
fi
echo ""

# Step 6: Deploy
echo "Step 6: Deploy to Vercel"
echo "------------------------"
echo "Choose deployment type:"
echo "  1. Preview (test deployment)"
echo "  2. Production"
read -p "Enter choice (1 or 2): " deploy_type

case $deploy_type in
    1)
        echo "🚀 Deploying preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Wait for deployment to complete (3-5 minutes)"
echo "2. Copy your deployment URL"
echo "3. Update CORS_ORIGIN in Vercel dashboard"
echo "4. Run database migrations (see DEPLOYMENT_CHECKLIST.md)"
echo "5. Test your deployed app"
echo ""
echo "View logs with: vercel logs"
echo "See full guide: DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🎉 Happy deploying!"

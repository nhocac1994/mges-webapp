#!/bin/bash

# Script setup Git và push lên GitHub cho Frontend

echo "🚀 Setting up Git repository for Frontend..."

# Init git (nếu chưa có)
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add remote (nếu chưa có)
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/nhocac1994/mges-webapp.git
fi

# Check remote
echo "📋 Current remotes:"
git remote -v

# Add files
echo "📝 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Deploy frontend to Vercel"

# Set branch
echo "🌿 Setting branch to main..."
git branch -M main

# Push
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Frontend đã được push lên GitHub."
echo "📋 Bước tiếp theo: Deploy trên Vercel (xem DEPLOY_VERCEL.md)"


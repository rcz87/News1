#!/bin/bash

echo "🚀 Pushing Multi-Site News Network Portal to GitHub..."
echo ""

# Configure Git
echo "⚙️  Configuring Git..."
git config user.name "rico ary setiadi"
git config user.email "ri.coz.ap87@gmail.com"

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
  echo "ℹ️  Remote 'origin' already exists, removing..."
  git remote remove origin
fi

# Add all files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Multi-Site News Network Portal with 10 channels

Features:
- 10 independent news channels with unique branding
- Markdown-based content management (64 articles)
- React + Vite + Express + TypeScript stack
- SEO optimized with dynamic meta tags
- Category filtering and article detail pages
- Responsive design with Tailwind CSS
- File-based content system (no database needed)
- Ready for VPS deployment with wildcard DNS

Channels: ambal, puring, kebayoran, menteng, senayan, cipete, gandaria, pondok, tebet, kuningan"

# Add remote
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/rcz87/NEWS.git

# Rename branch to main
echo "🌿 Setting branch to main..."
git branch -M main

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code has been pushed to:"
echo "   https://github.com/rcz87/NEWS"
echo ""
echo "🎉 Repository is now ready for VPS deployment!"

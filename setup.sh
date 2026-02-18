#!/bin/bash
# 𓂀 Book of Hours — Quick Setup & Deploy Script
# Run this after cloning and before first deploy.

set -e

echo ""
echo "𓂀  Book of Hours — Setup"
echo "========================"
echo ""

# Check for GitHub username
if [ -z "$1" ]; then
  echo "Usage: ./setup.sh YOUR_GITHUB_USERNAME"
  echo ""
  echo "Example: ./setup.sh medusa"
  exit 1
fi

USERNAME=$1

echo "→ Setting GitHub username to: $USERNAME"

# Update package.json homepage
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/USERNAME/$USERNAME/g" package.json
else
  sed -i "s/USERNAME/$USERNAME/g" package.json
fi

echo "→ Updated package.json homepage"

# Install dependencies
echo "→ Installing dependencies..."
npm install

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create a repo on GitHub named 'book-of-hours'"
echo "  2. Run these commands:"
echo ""
echo "     git init"
echo "     git add ."
echo "     git commit -m 'initial commit'"
echo "     git branch -M main"
echo "     git remote add origin https://github.com/$USERNAME/book-of-hours.git"
echo "     git push -u origin main"
echo "     npm run deploy"
echo ""
echo "  3. Go to GitHub → Settings → Pages → Branch: gh-pages / root"
echo "  4. Your site: https://$USERNAME.github.io/book-of-hours/"
echo ""

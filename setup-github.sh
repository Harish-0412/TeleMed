#!/bin/bash

# TeleMed GitHub Setup Script
# This script initializes Git and pushes your project to GitHub

echo "🚀 TeleMed - GitHub Setup"
echo "=========================="
echo ""

# Get current directory
PROJECTDIR=$(pwd)
echo "Project Directory: $PROJECTDIR"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "⚙️  Configuring Git..."

# Configure git (optional - set these globally if needed)
# git config user.email "your-email@example.com"
# git config user.name "Your Name"

echo ""
echo "📝 Creating .gitignore..."

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist
*.cjs

# Misc
.DS_Store
.env
.env.local
.env.*.local
*.pem
.vscode/
.idea/

# Database
local.db
*.db
*.sqlite
*.sqlite3

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Temporary files
*.tmp
.cache
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

echo ""
echo "📦 Adding files to Git..."
git add .
echo "✅ Files added"

echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit: TeleMed - Complete Telemedicine Platform with 9 Core Services"

echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Harish-0412/TeleMed.git
echo "✅ Remote repository added"

echo ""
echo "🌳 Setting main branch..."
git branch -M main
echo "✅ Main branch set"

echo ""
echo "📤 Ready to push to GitHub!"
echo ""
echo "Next steps:"
echo "1. Run: git push -u origin main"
echo ""
echo "If you get authentication errors:"
echo "  - Use GitHub Personal Access Token instead of password"
echo "  - Generate one at: https://github.com/settings/tokens"
echo ""
echo "✨ Setup complete!"

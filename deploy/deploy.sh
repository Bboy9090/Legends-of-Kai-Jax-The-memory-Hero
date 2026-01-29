#!/bin/bash

# LEGENDS OF KAI-JAX - DEPLOYMENT SCRIPT
# Mac/Linux Bash Deployment Script

echo "🎮 LEGENDS OF KAI-JAX - DEPLOYMENT INITIALIZED"
echo "============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Running git init..."
    git init
    echo "✅ Git initialized."
fi

# Check for required files
required_files=("index.html" "manifest.json" "sw.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please ensure all PWA files are in the root directory."
    exit 1
fi

echo "✅ All required files found."
echo ""

# Check if .github/workflows exists
if [ ! -d .github/workflows ]; then
    echo "Creating GitHub Actions directory..."
    mkdir -p .github/workflows
    echo "✅ Directory created."
fi

# Add all files to git
echo "📦 Staging files for commit..."
git add .

# Commit with timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")
commit_message="Deploy: Legends of Kai-Jax PWA - $timestamp"

echo "💾 Committing changes..."
git commit -m "$commit_message"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  No remote repository configured."
    echo "Please run: git remote add origin YOUR_GITHUB_REPO_URL"
    echo ""
    echo "Example:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/Legends-of-Kai-Jax-The-memory-Hero.git"
    echo ""
    echo "Then run this script again to push."
    exit 0
fi

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "============================================="
    echo ""
    echo "Your game will be live at:"
    echo "https://YOUR_USERNAME.github.io/Legends-of-Kai-Jax-The-memory-Hero"
    echo ""
    echo "⏳ Wait 2-3 minutes for GitHub Pages to build."
    echo ""
    echo "🎮 THE LEGEND IS LIVE!"
else
    echo ""
    echo "❌ Deployment failed. Check your git remote configuration."
    exit 1
fi

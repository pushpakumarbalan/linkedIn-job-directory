#!/bin/bash

# Deploy LinkedIn Job Directory to pushpakumar.com
echo "🚀 Deploying LinkedIn Job Directory..."

# Add all changes
git add .

# Commit changes
echo "📝 Committing changes..."
git commit -m "Update domain to pushpakumar.com and improve site functionality"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "📍 Your site will be available at: https://pushpakumar.com/projects/linkedIn-job-directory"
echo ""
echo "Next steps:"
echo "1. Configure your DNS settings (if using custom domain)"
echo "2. Set up GitHub Pages in repository settings"
echo "3. Enable HTTPS in GitHub Pages settings"
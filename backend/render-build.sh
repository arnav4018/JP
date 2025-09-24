#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting Render build process for Job Portal Backend..."
echo "========================================================"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create uploads directory if it doesn't exist
echo "📁 Setting up upload directory..."
mkdir -p uploads
chmod 755 uploads

# Verify Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Check if required files exist
echo "🔍 Checking required files..."
if [ -f "server.js" ]; then
    echo "   ✅ server.js found"
else
    echo "   ❌ server.js not found"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json found"
else
    echo "   ❌ package.json not found"
    exit 1
fi

# Test database connection (with timeout)
echo "🔍 Testing database connection..."
timeout 30s node verify-render-database.js || echo "⚠️ Database test failed or timed out, but continuing deployment..."

# Set production permissions
echo "🔐 Setting production permissions..."
find . -type f -name "*.js" -exec chmod 644 {} \;

echo "✅ Build completed successfully!"
echo "🎉 Job Portal Backend is ready for deployment"

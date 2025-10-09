#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Starting Minimal Render Build Process..."
echo "==========================================="

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

# Set production permissions
echo "🔐 Setting production permissions..."
find . -type f -name "*.js" -exec chmod 644 {} \;

echo "✅ Minimal build completed successfully!"
echo "🎉 Ready for deployment without database verification"
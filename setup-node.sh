#!/bin/bash

echo "🔧 Setting up Node.js environment..."

# Use Node.js 20
echo "📦 Switching to Node.js 20..."
nvm use 20

# Verify Node.js version
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete! You can now run:"
echo "  npm run dev          # Start development servers"
echo "  npm run build:web    # Build web app"
echo "  npm run build:api    # Build API"
echo "  npm run build        # Build all"

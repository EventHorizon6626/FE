#!/bin/bash

# Start Event Horizon Frontend in Development Mode

echo "🚀 Starting Event Horizon Frontend (Development Mode)..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
    echo ""
fi

# Start the development server
echo "🔥 Starting development server on http://localhost:3000"
npm start

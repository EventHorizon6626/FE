#!/bin/bash

# Stop all Event Horizon Frontend instances

echo "🛑 Stopping all Event Horizon Frontend instances..."
echo ""

# Stop Docker containers
echo "🐳 Stopping Docker containers..."
docker-compose down 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Docker containers stopped"
else
    echo "ℹ️  No Docker containers running"
fi
echo ""

# Stop development server (React)
echo "🔴 Stopping development server..."
pkill -f "react-scripts start" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Development server stopped"
else
    echo "ℹ️  No development server running"
fi
echo ""

# Check for any node processes on port 3000
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️  Process still running on port 3000, attempting to kill..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
    echo "✅ Port 3000 freed"
fi

# Check for any processes on port 80
if lsof -ti:80 >/dev/null 2>&1; then
    echo "⚠️  Process still running on port 80 (may require sudo)"
fi

echo ""
echo "✅ All instances stopped!"

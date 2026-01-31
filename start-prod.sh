#!/bin/bash

# Start Event Horizon Frontend in Production Mode (Docker)

echo "🚀 Starting Event Horizon Frontend (Production Mode with Docker)..."
echo ""

# Check if docker network exists, create if not
if ! docker network inspect eventhorizon-network >/dev/null 2>&1; then
    echo "📡 Creating Docker network: eventhorizon-network"
    docker network create eventhorizon-network
    echo ""
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down
echo ""

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build
echo ""

echo "🚀 Starting containers..."
docker-compose up -d
echo ""

# Show logs
echo "✅ Frontend deployed successfully!"
echo "📍 Access the app at: http://localhost:80"
echo ""
echo "📋 View logs with: npm run docker:logs"
echo "🛑 Stop with: ./stop-all.sh or npm run docker:down"

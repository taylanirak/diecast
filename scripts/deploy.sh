#!/bin/bash

# Tarodan Deployment Script
# This script handles deployment of the Tarodan application

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/opt/tarodan"

echo "🚀 Starting Tarodan Deployment..."
echo "Environment: $ENVIRONMENT"
echo ""

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build packages
echo "🔨 Building packages..."
pnpm run build --filter=@tarodan/types
pnpm run build --filter=@tarodan/validators
pnpm run build --filter=@tarodan/api-client
pnpm run build --filter=@tarodan/core
pnpm run build --filter=@tarodan/ui

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/api
npx prisma migrate deploy
cd ../..

# Build and restart services
if [ "$ENVIRONMENT" == "production" ]; then
    echo "🐳 Building and deploying Docker containers..."
    docker-compose -f infrastructure/docker-compose.prod.yml pull
    docker-compose -f infrastructure/docker-compose.prod.yml up -d --build
else
    echo "🐳 Building and deploying Docker containers (staging)..."
    docker-compose -f infrastructure/docker-compose.yml up -d --build
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🏥 Running health checks..."
curl -f http://localhost:3001/health || exit 1
echo "API is healthy"

curl -f http://localhost:3000 || exit 1
echo "Web is healthy"

curl -f http://localhost:3002 || exit 1
echo "Admin is healthy"

# Cleanup old images
echo "🗑️ Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "Services:"
echo "  - Web:   http://localhost:3000"
echo "  - Admin: http://localhost:3002"
echo "  - API:   http://localhost:3001"

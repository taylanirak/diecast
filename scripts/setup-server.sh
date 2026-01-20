#!/bin/bash

# Tarodan Server Setup Script
# This script sets up a new server for Tarodan deployment

set -e

echo "🚀 Starting Tarodan Server Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed"
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm already installed"
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/tarodan/{uploads,logs,backups}
sudo chown -R $USER:$USER /var/tarodan

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt-get install -y certbot

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in .env"
echo "2. Run 'docker-compose -f docker-compose.prod.yml up -d'"
echo "3. Run Certbot to generate SSL certificates"

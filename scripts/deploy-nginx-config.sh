#!/bin/bash
# Deploy Nginx Configuration for News1
# This script applies the correct nginx configuration to fix HTTPS API proxy issues

set -e

echo "=================================================="
echo "News1 - Nginx Configuration Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo ./scripts/deploy-nginx-config.sh"
    exit 1
fi

# Backup existing configuration
echo -e "${YELLOW}1. Backing up existing nginx configuration...${NC}"
BACKUP_DIR="/root/nginx-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

if [ -f /etc/nginx/sites-available/news-network ]; then
    cp /etc/nginx/sites-available/news-network "$BACKUP_DIR/news-network.$TIMESTAMP.bak"
    echo -e "${GREEN}   ✓ Backup created: $BACKUP_DIR/news-network.$TIMESTAMP.bak${NC}"
else
    echo -e "${YELLOW}   ! No existing configuration found${NC}"
fi

# Copy new configuration
echo -e "${YELLOW}2. Installing new nginx configuration...${NC}"
cp nginx/news1.conf /etc/nginx/sites-available/news-network
echo -e "${GREEN}   ✓ Configuration copied to /etc/nginx/sites-available/news-network${NC}"

# Enable site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/news-network ]; then
    echo -e "${YELLOW}3. Enabling site...${NC}"
    ln -s /etc/nginx/sites-available/news-network /etc/nginx/sites-enabled/
    echo -e "${GREEN}   ✓ Site enabled${NC}"
else
    echo -e "${GREEN}3. Site already enabled${NC}"
fi

# Test nginx configuration
echo -e "${YELLOW}4. Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}   ✓ Configuration test passed${NC}"
else
    echo -e "${RED}   ✗ Configuration test failed${NC}"
    echo -e "${YELLOW}   Rolling back to previous configuration...${NC}"
    if [ -f "$BACKUP_DIR/news-network.$TIMESTAMP.bak" ]; then
        cp "$BACKUP_DIR/news-network.$TIMESTAMP.bak" /etc/nginx/sites-available/news-network
        echo -e "${RED}   Configuration rolled back${NC}"
    fi
    exit 1
fi

# Reload nginx
echo -e "${YELLOW}5. Reloading nginx...${NC}"
if systemctl reload nginx; then
    echo -e "${GREEN}   ✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}   ✗ Failed to reload nginx${NC}"
    exit 1
fi

# Verify service status
echo -e "${YELLOW}6. Verifying services...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}   ✓ Nginx is running${NC}"
else
    echo -e "${RED}   ✗ Nginx is not running${NC}"
    exit 1
fi

if systemctl is-active --quiet news1; then
    echo -e "${GREEN}   ✓ News1 backend is running${NC}"
else
    echo -e "${RED}   ✗ News1 backend is not running${NC}"
    echo -e "${YELLOW}   Starting News1 service...${NC}"
    systemctl start news1
fi

# Test API endpoint
echo -e "${YELLOW}7. Testing API endpoints...${NC}"
echo ""

# Test local endpoint
echo "   Testing local API (http://localhost:5000/api/channels)..."
LOCAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/channels)
if [ "$LOCAL_RESPONSE" = "200" ]; then
    echo -e "${GREEN}   ✓ Local API: $LOCAL_RESPONSE OK${NC}"
else
    echo -e "${RED}   ✗ Local API: $LOCAL_RESPONSE${NC}"
fi

# Test HTTPS endpoint
echo "   Testing HTTPS API (https://wisanggeni.cloud/api/channels)..."
HTTPS_RESPONSE=$(curl -s -H "Accept: application/json" https://wisanggeni.cloud/api/channels)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: application/json" https://wisanggeni.cloud/api/channels)

if [ "$HTTPS_CODE" = "200" ]; then
    # Check if response is JSON
    if echo "$HTTPS_RESPONSE" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}   ✓ HTTPS API: $HTTPS_CODE OK (JSON response)${NC}"
    else
        echo -e "${RED}   ✗ HTTPS API: Returns HTML instead of JSON${NC}"
        echo "   Response preview:"
        echo "$HTTPS_RESPONSE" | head -c 200
        echo ""
    fi
else
    echo -e "${RED}   ✗ HTTPS API: $HTTPS_CODE${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "Configuration file: /etc/nginx/sites-available/news-network"
echo "Backup location: $BACKUP_DIR/news-network.$TIMESTAMP.bak"
echo ""
echo "Test API endpoint:"
echo "  curl -H 'Accept: application/json' https://wisanggeni.cloud/api/channels"
echo ""
echo "View nginx logs:"
echo "  tail -f /var/log/nginx/news-network-access.log"
echo "  tail -f /var/log/nginx/news-network-error.log"
echo ""
echo "Check services:"
echo "  systemctl status nginx"
echo "  systemctl status news1"
echo ""

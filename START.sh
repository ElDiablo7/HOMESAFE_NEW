#!/bin/bash
# ====================================
#  GRACE-X AI - Quick Start
#  v6.4.1 - Zac Crockett
# ====================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to script directory
cd "$(dirname "$0")"

echo ""
echo "Starting GRACE-X AI v6.4.1..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js not installed!${NC}"
    echo ""
    echo "Download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# First run? Install dependencies
if [ ! -d "server/node_modules" ]; then
    echo "Installing dependencies..."
    cd server
    npm install --silent
    cd ..
fi

# Check API key
if [ ! -f "server/.env" ]; then
    echo ""
    echo -e "${YELLOW}WARNING: No API key configured${NC}"
    echo "Copy server/env.example.txt to server/.env"
    echo ""
    sleep 2
fi

# Kill old instances
echo "Stopping old instances..."
pkill -f "node server.js" 2>/dev/null
pkill -f "http-server" 2>/dev/null
sleep 1

# Start backend (background)
echo ""
echo -e "${GREEN}Starting backend...${NC}"
cd server
node server.js > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..
sleep 2

echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:8080"
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080" 2>/dev/null
elif command -v open &> /dev/null; then
    open "http://localhost:8080" 2>/dev/null
fi

# Start frontend server
echo "=== GRACE-X AI RUNNING ==="
echo "Press Ctrl+C to stop"
echo "==========================="
echo ""

npx -y http-server -p 8080 -c-1

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null

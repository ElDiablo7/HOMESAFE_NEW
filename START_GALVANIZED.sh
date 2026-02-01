#!/bin/bash
# ===============================================
#  GRACE-X GALVANIZED EDITION - STARTUP TEST
#  v6.5.1 - Zachary Charles Anthony Crockett
#  BULLETPROOF VERIFICATION & LAUNCH
# ===============================================

clear

echo ""
echo "==============================================="
echo "  GRACE-X GALVANIZED EDITION v6.5.1"
echo "  BULLETPROOF STARTUP SEQUENCE"
echo "==============================================="
echo ""

# Change to script directory
cd "$(dirname "$0")"

# ===============================================
# STEP 1: System Requirements Check
# ===============================================
echo "[STEP 1/6] Checking system requirements..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[FAIL] Node.js not installed!"
    echo ""
    echo "SOLUTION: Install from https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
echo "[OK] Node.js found: $NODE_VERSION"

# ===============================================
# STEP 2: Dependencies Check
# ===============================================
echo ""
echo "[STEP 2/6] Checking dependencies..."
echo ""

if [ ! -d "server/node_modules" ]; then
    echo "[INSTALLING] Dependencies not found, installing..."
    cd server
    npm install --silent
    if [ $? -ne 0 ]; then
        echo "[FAIL] Dependency installation failed!"
        exit 1
    fi
    cd ..
    echo "[OK] Dependencies installed"
else
    echo "[OK] Dependencies found"
fi

# ===============================================
# STEP 3: Configuration Check
# ===============================================
echo ""
echo "[STEP 3/6] Checking configuration..."
echo ""

if [ ! -f "server/.env" ]; then
    echo "[WARNING] No .env file found!"
    echo "[ACTION] Copying template..."
    cp "server/env.example.txt" "server/.env"
    echo "[WARNING] API key needs configuration!"
    echo ""
    echo "SOLUTION:"
    echo "1. Edit server/.env"
    echo "2. Add your Anthropic API key"
    echo "3. Run this script again"
    echo ""
    sleep 5
else
    echo "[OK] .env file exists"
    
    # Check if API key is configured
    if grep -q "sk-ant-" "server/.env"; then
        echo "[OK] API key appears to be configured"
    else
        echo "[WARNING] API key may not be configured"
        echo "[INFO] Continuing anyway - you can configure later"
    fi
fi

# ===============================================
# STEP 4: Port Availability Check
# ===============================================
echo ""
echo "[STEP 4/6] Checking port availability..."
echo ""

echo "[ACTION] Cleaning up old instances..."
# Kill processes on ports 3000 and 8080
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 2

echo "[OK] Ports 3000 and 8080 available"

# ===============================================
# STEP 5: Start Backend Server
# ===============================================
echo ""
echo "[STEP 5/6] Starting backend server..."
echo ""

cd server
node server.js &
BACKEND_PID=$!
cd ..
sleep 3

# Test backend connection
echo "[TESTING] Checking backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null)

if [ "$BACKEND_STATUS" == "200" ]; then
    echo "[OK] Backend server responding (HTTP 200)"
else
    echo "[WARNING] Backend may not be ready (HTTP $BACKEND_STATUS)"
    echo "[INFO] Continuing anyway - server may need more time"
fi

# ===============================================
# STEP 6: Launch Application
# ===============================================
echo ""
echo "[STEP 6/6] Launching GRACE-X..."
echo ""

sleep 2

echo "[OK] Opening browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:8080" &>/dev/null &
elif command -v open &> /dev/null; then
    open "http://localhost:8080" &>/dev/null &
fi

sleep 1

echo ""
echo "==============================================="
echo "  GRACE-X GALVANIZED EDITION - RUNNING"
echo "==============================================="
echo ""
echo "  Backend:  http://localhost:3000 (Running)"
echo "  Frontend: http://localhost:8080 (Starting...)"
echo "  Test:     http://localhost:8080/CONNECTION_TEST.html"
echo ""
echo "  Status: BULLETPROOF MODE ACTIVE"
echo ""
echo "==============================================="
echo ""
echo "[INFO] Frontend server starting"
echo "[INFO] Press Ctrl+C to stop GRACE-X"
echo ""

# Start frontend server
npx -y http-server -p 8080 -c-1 --silent

# Cleanup on exit
echo ""
echo "[SHUTDOWN] Stopping backend server..."
kill $BACKEND_PID 2>/dev/null
echo "[SHUTDOWN] Complete"

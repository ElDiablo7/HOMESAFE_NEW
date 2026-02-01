#!/bin/bash
# GRACE-X Level 5 API Server Setup Script v2.0 (Mac/Linux)

echo ""
echo "========================================================"
echo "  GRACE-X Level 5 API Server Setup v2.0"
echo "========================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "[OK] Node.js found: $NODE_VERSION"

echo ""
echo "[1/4] Installing production dependencies..."
npm install --omit=dev
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi
echo "[OK] Dependencies installed"

echo ""
echo "[2/4] Installing development dependencies..."
npm install --save-dev nodemon eslint
echo "[OK] Dev dependencies installed"

echo ""
echo "[3/4] Setting up environment file..."
if [ ! -f .env ]; then
    if [ -f env.example.txt ]; then
        cp env.example.txt .env
        echo "[OK] Created .env file from template"
        echo ""
        echo "========================================================"
        echo "  IMPORTANT: Edit .env and add your API key!"
        echo "========================================================"
        echo ""
        echo "  Supported providers:"
        echo "  - OpenAI:     Get key at https://platform.openai.com/api-keys"
        echo "  - Anthropic:  Get key at https://console.anthropic.com/"
        echo "  - OpenRouter: Get key at https://openrouter.ai/keys"
        echo "  - Ollama:     Free local LLM - https://ollama.ai"
        echo ""
    else
        echo "[WARNING] env.example.txt not found"
    fi
else
    echo "[OK] .env file already exists"
fi

echo ""
echo "[4/4] Setup complete!"
echo ""
echo "========================================================"
echo "  Next steps:"
echo "========================================================"
echo ""
echo "  1. Edit .env and configure your API provider/key"
echo "  2. Start the server:"
echo "     - Production:  npm start"
echo "     - Development: npm run dev"
echo ""
echo "  3. Test the server:"
echo "     curl http://localhost:3000/health"
echo ""

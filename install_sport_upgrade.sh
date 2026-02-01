#!/bin/bash
# ============================================
# GRACE-X Sport™ Module v7.0 - Installation Script
# © Zac Crockett & Jason Treadaway
# ============================================

echo "============================================"
echo " GRACE-X Sport™ v7.0 - Installation"
echo "============================================"
echo ""

# Check if running in correct directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the TITAN root directory"
    exit 1
fi

echo "✅ Detected TITAN directory"
echo ""

# Backup existing files
echo "📦 Creating backups..."
if [ -f "modules/sport.html" ]; then
    cp modules/sport.html modules/sport_backup_$(date +%Y%m%d_%H%M%S).html
    echo "   ✅ Backed up sport.html"
fi

if [ -f "server/server.js" ]; then
    cp server/server.js server/server_backup_$(date +%Y%m%d_%H%M%S).js
    echo "   ✅ Backed up server.js"
fi

if [ -f "server/.env" ]; then
    cp server/.env server/.env_backup_$(date +%Y%m%d_%H%M%S)
    echo "   ✅ Backed up .env"
fi

echo ""

# Install sports-api.js if not exists
if [ -f "upgrade_files/sports-api.js" ]; then
    echo "📥 Installing sports-api.js..."
    cp upgrade_files/sports-api.js server/sports-api.js
    echo "   ✅ Installed server/sports-api.js"
else
    echo "   ⚠️  Warning: sports-api.js not found in upgrade_files/"
fi

# Update sport.html
if [ -f "upgrade_files/sport.html" ]; then
    echo "📥 Installing upgraded sport.html..."
    cp upgrade_files/sport.html modules/sport.html
    echo "   ✅ Installed modules/sport.html"
else
    echo "   ⚠️  Warning: sport.html not found in upgrade_files/"
fi

echo ""
echo "⚙️  Configuration Required:"
echo ""
echo "1. Edit server/.env and add your API keys:"
echo "   - RAPIDAPI_KEY=your_key_here"
echo "   - THE_ODDS_API_KEY=your_key_here"
echo ""
echo "2. Restart the server:"
echo "   cd server && npm start"
echo ""
echo "3. Access Sport module in TITAN"
echo ""
echo "✅ Installation Complete!"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   SPORT_MODULE_V7_UPGRADE_GUIDE.md"
echo ""
echo "============================================"

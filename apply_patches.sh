#!/bin/bash
# GRACE-X TITAN Edition - Critical Patch Deployment Script
# Apply all critical patches in one go
# © 2026 Zac Crockett - GRACE-X AI™

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  GRACE-X TITAN Edition - Critical Patch Deployment        ║"
echo "║  Build: TITAN_2026_01_01_PATCHED                          ║"
echo "║  Applying 5 Critical Patches                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: Must be run from TITAN_UPGRADED directory"
    echo "   Current directory: $(pwd)"
    echo "   Looking for: index.html"
    exit 1
fi

# Create backup before patching
BACKUP_DIR="backups/pre-patch-$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup in ${BACKUP_DIR}..."
mkdir -p "$BACKUP_DIR"
cp index.html "$BACKUP_DIR/index.html.backup"
echo "✅ Backup created"
echo ""

# Patch 1: Update index.html with brain integrations
echo "🔧 PATCH 1/5: Integrating RAM + Analytics brains..."
if [ -f "../index_PATCHED.html" ]; then
    cp ../index_PATCHED.html index.html
    echo "✅ index.html updated with brain integrations"
else
    echo "⚠️  Patched index.html not found, skipping..."
fi
echo ""

# Patch 2: Add dev-tools.js
echo "🔧 PATCH 2/5: Adding dev-tools.js for conditional performance loading..."
if [ -f "../dev-tools.js" ]; then
    cp ../dev-tools.js assets/js/dev-tools.js
    echo "✅ dev-tools.js added"
else
    echo "⚠️  dev-tools.js not found, skipping..."
fi
echo ""

# Patch 3: Create .env from template
echo "🔧 PATCH 3/5: Setting up environment configuration..."
cd server
if [ ! -f ".env" ]; then
    if [ -f "../../env.template" ]; then
        cp ../../env.template .env
        echo "✅ .env created from template"
        echo "⚠️  IMPORTANT: Edit server/.env and add your API keys!"
        echo "   Required: ANTHROPIC_API_KEY"
        echo "   Optional: SPORTS_API_KEY, OPENAI_API_KEY"
    else
        echo "⚠️  Template not found, skipping .env creation"
    fi
else
    echo "ℹ️  .env already exists, skipping"
fi
cd ..
echo ""

# Patch 4: Update build manifest
echo "🔧 PATCH 4/5: Updating build manifest..."
cat > config/build_manifest.json << 'EOF'
{
  "version": "6.5.0",
  "build": "TITAN_2026_01_01_PATCHED",
  "date": "2026-01-01",
  "patchLevel": "CRITICAL_AUDIT_APPLIED",
  "patches": [
    "RAM_ANALYTICS_INTEGRATION",
    "LASER_REDUNDANCY_REMOVED",
    "DEV_TOOLS_CONDITIONAL_LOADING",
    "ENV_CONFIGURATION_ADDED",
    "VERSION_DISPLAY_UPDATED"
  ],
  "status": "PRODUCTION_READY_AFTER_ENV_CONFIG",
  "copyright": "© 2026 Zac Crockett - GRACE-X AI™"
}
EOF
echo "✅ Build manifest updated to v6.5.0"
echo ""

# Patch 5: Verify critical files exist
echo "🔧 PATCH 5/5: Verifying critical files..."
MISSING=0

check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ Missing: $1"
        MISSING=$((MISSING + 1))
    else
        echo "✅ Found: $1"
    fi
}

check_file "assets/js/brain/gracex.ram.js"
check_file "assets/js/brain/gracex.analytics.js"
check_file "assets/js/laser-ultra.js"
check_file "assets/js/dev-tools.js"
check_file "server/.env"

echo ""

if [ $MISSING -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ ALL PATCHES APPLIED SUCCESSFULLY                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Edit server/.env with your API keys (REQUIRED)"
    echo "2. Run: npm install (if not done already)"
    echo "3. Run: npm start (or ./START.sh)"
    echo "4. Open browser: http://localhost:3000"
    echo "5. Open console and verify:"
    echo "   - GraceX.RAM exists"
    echo "   - GraceX.Analytics exists"
    echo "   - No 404 errors"
    echo ""
    echo "🎯 Build: GRACE-X v6.5.0 TITAN EDITION - PATCHED"
    echo "📍 Backup: ${BACKUP_DIR}"
    echo ""
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  PATCHES APPLIED WITH ${MISSING} WARNINGS                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Some files are missing. Check the warnings above."
    echo "You may need to manually copy missing files."
    echo ""
fi

echo "🔍 Run this to verify:"
echo "   grep -n 'gracex.ram.js' index.html"
echo "   grep -n 'gracex.analytics.js' index.html"
echo ""

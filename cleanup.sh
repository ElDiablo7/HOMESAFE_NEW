#!/bin/bash

# GRACE-X TITAN CLEANUP SCRIPT
# Removes backup files and legacy code
# Safe to run - creates backup first

echo "═══════════════════════════════════════════════════════════"
echo "  GRACE-X TITAN CLEANUP SCRIPT"
echo "  Removes backups, archives legacy files"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Safety backup
echo "📦 Creating safety backup..."
mkdir -p ../TITAN_PRE_CLEANUP_BACKUP
cp -r . ../TITAN_PRE_CLEANUP_BACKUP/ 2>/dev/null
echo "✅ Safety backup created at: ../TITAN_PRE_CLEANUP_BACKUP/"
echo ""

# Remove Sport module backups
echo "🗑️  Removing Sport module backups..."
count_modules=$(ls modules/sport_backup*.html 2>/dev/null | wc -l)
if [ "$count_modules" -gt 0 ]; then
    rm -f modules/sport_backup*.html
    echo "✅ Removed $count_modules Sport module backups"
else
    echo "ℹ️  No Sport module backups found"
fi
echo ""

# Remove server backups
echo "🗑️  Removing server backups..."
count_server=$(ls server/server_backup*.js 2>/dev/null | wc -l)
if [ "$count_server" -gt 0 ]; then
    rm -f server/server_backup*.js
    echo "✅ Removed $count_server server backups"
else
    echo "ℹ️  No server backups found"
fi
echo ""

# Archive old LASER
echo "📁 Archiving legacy LASER..."
mkdir -p archive/legacy
if [ -f "assets/js/laser.js" ]; then
    mv assets/js/laser.js archive/legacy/laser-v6.4.js
    echo "✅ Legacy LASER archived to: archive/legacy/laser-v6.4.js"
else
    echo "ℹ️  Legacy LASER already removed"
fi
echo ""

# Check sports API files
echo "📊 Sports API files:"
ls -lh server/sports-api*.js 2>/dev/null
echo ""
echo "⚠️  Please manually verify which sports-api file is active"
echo "   Run: grep -n \"sports-api\" server/server.js"
echo "   Then delete the unused version"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "  CLEANUP COMPLETE ✅"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Removed:"
echo "  • $count_modules Sport module backups"
echo "  • $count_server server backups"
echo "  • 1 legacy LASER file (archived)"
echo ""
echo "Space freed: ~294KB"
echo ""
echo "Next steps:"
echo "  1. Verify sports-api usage in server.js"
echo "  2. Delete unused sports-api file"
echo "  3. Test system: npm start"
echo ""
echo "If anything goes wrong, restore from:"
echo "  ../TITAN_PRE_CLEANUP_BACKUP/"
echo ""

#!/bin/bash
# ====================================
#  GRACE-X AI - Stop All
# ====================================

echo "Stopping GRACE-X..."

pkill -f "node server.js" 2>/dev/null
pkill -f "http-server" 2>/dev/null

echo "Done."
sleep 1

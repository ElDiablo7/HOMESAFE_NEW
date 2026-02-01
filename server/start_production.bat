@echo off
echo ===================================================
echo GRACE-X AI SYSTEM - PRODUCTION START
echo ===================================================
echo.
echo Setting environment to PRODUCTION...
set NODE_ENV=production

echo.
echo Starting GRACE-X Brain Server...
echo Access the interface at http://localhost:3000
echo.

npm start

pause

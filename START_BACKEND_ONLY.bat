@echo off
REM ============================
REM  GRACE-X Backend Only
REM  Start just the API server
REM ============================

title GRACE-X Backend Server

REM Change to server directory
cd /d "%~dp0server"

echo Starting GRACE-X Backend Server...
echo.
echo Server will run on: http://localhost:3000
echo.
echo To stop: Press Ctrl+C
echo =========================
echo.

REM Start the backend server
node server.js

echo.
echo Server stopped.
pause
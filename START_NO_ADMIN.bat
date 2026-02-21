@echo off
REM ====================================
REM  GRACE-X AI - Quick Start (No Admin)
REM  v6.4.1 - Zac Crockett
REM ====================================

title GRACE-X Launcher (No Admin)

REM Change to script directory
cd /d "%~dp0"

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not installed!
    echo.
    echo Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM First run? Install dependencies
if not exist "server\node_modules" (
    echo Installing dependencies...
    cd server
    call npm install --silent
    cd ..
)

REM Check API key
if not exist "server\.env" (
    echo.
    echo WARNING: No API key configured
    echo Copy server\env.example.txt to server\.env
    echo.
    timeout /t 3 /nobreak >nul
)

REM Try to kill processes gracefully (no /F flag)
echo Stopping any existing servers...
taskkill /FI "WINDOWTITLE eq GRACE-X*" >nul 2>nul
taskkill /PID 3000 >nul 2>nul
taskkill /PID 8080 >nul 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting GRACE-X AI v6.4.1...
echo.

REM Start backend (from repo root)
start "GRACE-X Backend" /min cmd /c "cd /d %~dp0 && node server/server.js"
timeout /t 3 /nobreak >nul

echo Backend:  http://localhost:3000 (running)
echo.
echo Opening browser...
start "" "http://localhost:3000"

echo.
echo === GRACE-X AI RUNNING ===
echo App: http://localhost:3000 (brain + CallAssist)
echo Close the minimized "GRACE-X Backend" window to stop
echo ================================
echo.
pause
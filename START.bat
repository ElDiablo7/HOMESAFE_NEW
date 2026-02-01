@echo off
REM ====================================
REM  GRACE-X AI - Quick Start
REM  v6.4.1 - Zac Crockett
REM ====================================

title GRACE-X Launcher

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

REM Kill old instances
taskkill /F /FI "WINDOWTITLE eq GRACE-X*" >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
timeout /t 1 /nobreak >nul

echo.
echo Starting GRACE-X AI v6.4.1...
echo.

REM Start backend (hidden)
start "GRACE-X Backend" /min cmd /c "cd /d %~dp0server && node server.js"
timeout /t 2 /nobreak >nul

echo Backend:  http://localhost:3000 (running)
echo Frontend: http://localhost:8080 (starting...)
echo.
echo Opening browser...
timeout /t 1 /nobreak >nul

REM Open browser
start "" "http://localhost:8080"

REM Start frontend server (this window)
echo.
echo === GRACE-X AI RUNNING ===
echo Close this window to stop
echo ===========================
echo.
npx -y http-server -p 8080 -c-1 --silent

pause

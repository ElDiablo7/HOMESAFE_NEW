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

REM Start backend in current window
echo Starting backend server...
cd /d "%~dp0server"
start "GRACE-X Backend" cmd /c "node server.js"
cd /d "%~dp0"
timeout /t 3 /nobreak >nul

echo Backend:  http://localhost:3000 (starting)
echo Frontend: http://localhost:8080 (starting...)
echo.
echo === GRACE-X AI IS STARTING ===
echo Wait 5 seconds, then open your browser to:
echo http://localhost:8080
echo.
echo Press any key to stop servers...
echo ================================
echo.

REM Start frontend server (this window)
npx -y http-server -p 8080 -c-1 --silent

echo.
echo Servers stopped.
pause
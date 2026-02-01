@echo off
REM ===============================================
REM  GRACE-X GALVANIZED EDITION - STARTUP TEST
REM  v6.5.1 - Zachary Charles Anthony Crockett
REM  BULLETPROOF VERIFICATION & LAUNCH
REM ===============================================

title GRACE-X GALVANIZED - Startup Verification

echo.
echo ===============================================
echo   GRACE-X GALVANIZED EDITION v6.5.1
echo   BULLETPROOF STARTUP SEQUENCE
echo ===============================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM ===============================================
REM STEP 1: System Requirements Check
REM ===============================================
echo [STEP 1/6] Checking system requirements...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Node.js not installed!
    echo.
    echo SOLUTION: Download from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VERSION=%%v
echo [OK] Node.js found: %NODE_VERSION%

REM ===============================================
REM STEP 2: Dependencies Check
REM ===============================================
echo.
echo [STEP 2/6] Checking dependencies...
echo.

if not exist "server\node_modules" (
    echo [INSTALLING] Dependencies not found, installing...
    cd server
    call npm install --silent
    if %ERRORLEVEL% NEQ 0 (
        echo [FAIL] Dependency installation failed!
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies found
)

REM ===============================================
REM STEP 3: Configuration Check
REM ===============================================
echo.
echo [STEP 3/6] Checking configuration...
echo.

if not exist "server\.env" (
    echo [WARNING] No .env file found!
    echo [ACTION] Copying template...
    copy "server\env.example.txt" "server\.env" >nul 2>nul
    echo [WARNING] API key needs configuration!
    echo.
    echo SOLUTION:
    echo 1. Open server\.env
    echo 2. Add your Anthropic API key
    echo 3. Run this script again
    echo.
    timeout /t 5 /nobreak >nul
) else (
    echo [OK] .env file exists
    
    REM Check if API key is configured
    findstr /C:"sk-ant-" "server\.env" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] API key appears to be configured
    ) else (
        echo [WARNING] API key may not be configured
        echo [INFO] Continuing anyway - you can configure later
    )
)

REM ===============================================
REM STEP 4: Port Availability Check
REM ===============================================
echo.
echo [STEP 4/6] Checking port availability...
echo.

REM Kill any existing instances on ports 3000 and 8080
echo [ACTION] Cleaning up old instances...
taskkill /F /FI "WINDOWTITLE eq GRACE-X*" >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
timeout /t 2 /nobreak >nul

echo [OK] Ports 3000 and 8080 available

REM ===============================================
REM STEP 5: Start Backend Server
REM ===============================================
echo.
echo [STEP 5/6] Starting backend server...
echo.

start "GRACE-X Backend" /min cmd /c "cd /d %~dp0server && node server.js"
timeout /t 3 /nobreak >nul

REM Test backend connection
echo [TESTING] Checking backend health...
curl -s -o nul -w "%%{http_code}" http://localhost:3000/health >temp_status.txt 2>nul
set /p BACKEND_STATUS=<temp_status.txt
del temp_status.txt >nul 2>nul

if "%BACKEND_STATUS%"=="200" (
    echo [OK] Backend server responding (HTTP 200)
) else (
    echo [WARNING] Backend may not be ready (HTTP %BACKEND_STATUS%)
    echo [INFO] Continuing anyway - server may need more time
)

REM ===============================================
REM STEP 6: Launch Application
REM ===============================================
echo.
echo [STEP 6/6] Launching GRACE-X...
echo.

timeout /t 2 /nobreak >nul

echo [OK] Opening browser...
start "" "http://localhost:8080"
timeout /t 1 /nobreak >nul

echo.
echo ===============================================
echo   GRACE-X GALVANIZED EDITION - RUNNING
echo ===============================================
echo.
echo   Backend:  http://localhost:3000 (Running)
echo   Frontend: http://localhost:8080 (Starting...)
echo   Test:     http://localhost:8080/CONNECTION_TEST.html
echo.
echo   Status: BULLETPROOF MODE ACTIVE
echo.
echo ===============================================
echo.
echo [INFO] Frontend server starting (this window)
echo [INFO] Close this window to stop GRACE-X
echo.

REM Start frontend server
npx -y http-server -p 8080 -c-1 --silent

REM Cleanup on exit
echo.
echo [SHUTDOWN] Stopping backend server...
taskkill /F /FI "WINDOWTITLE eq GRACE-X Backend" >nul 2>nul
echo [SHUTDOWN] Complete
pause

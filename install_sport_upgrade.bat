@echo off
REM ============================================
REM GRACE-X Sport Module v7.0 - Installation
REM (C) Zac Crockett & Jason Treadaway
REM ============================================

echo ============================================
echo  GRACE-X Sport(TM) v7.0 - Installation
echo ============================================
echo.

REM Check if running in correct directory
if not exist "index.html" (
    echo ERROR: Please run this script from the TITAN root directory
    pause
    exit /b 1
)

echo Detected TITAN directory
echo.

REM Create backups
echo Creating backups...
if exist "modules\sport.html" (
    copy "modules\sport.html" "modules\sport_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.html" >nul
    echo    Backed up sport.html
)

if exist "server\server.js" (
    copy "server\server.js" "server\server_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.js" >nul
    echo    Backed up server.js
)

if exist "server\.env" (
    copy "server\.env" "server\.env_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%" >nul
    echo    Backed up .env
)

echo.

REM Install sports-api.js
if exist "upgrade_files\sports-api.js" (
    echo Installing sports-api.js...
    copy "upgrade_files\sports-api.js" "server\sports-api.js" >nul
    echo    Installed server\sports-api.js
) else (
    echo    Warning: sports-api.js not found in upgrade_files\
)

REM Update sport.html
if exist "upgrade_files\sport.html" (
    echo Installing upgraded sport.html...
    copy "upgrade_files\sport.html" "modules\sport.html" >nul
    echo    Installed modules\sport.html
) else (
    echo    Warning: sport.html not found in upgrade_files\
)

echo.
echo Configuration Required:
echo.
echo 1. Edit server\.env and add your API keys:
echo    - RAPIDAPI_KEY=your_key_here
echo    - THE_ODDS_API_KEY=your_key_here
echo.
echo 2. Restart the server:
echo    cd server ^&^& npm start
echo.
echo 3. Access Sport module in TITAN
echo.
echo Installation Complete!
echo.
echo For detailed setup instructions, see:
echo    SPORT_MODULE_V7_UPGRADE_GUIDE.md
echo.
echo ============================================
pause

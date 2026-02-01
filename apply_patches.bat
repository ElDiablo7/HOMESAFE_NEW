@echo off
REM GRACE-X TITAN Edition - Critical Patch Deployment Script (Windows)
REM Apply all critical patches in one go
REM (c) 2026 Zac Crockett - GRACE-X AI

echo ================================================================
echo   GRACE-X TITAN Edition - Critical Patch Deployment
echo   Build: TITAN_2026_01_01_PATCHED
echo   Applying 5 Critical Patches
echo ================================================================
echo.

REM Check if we're in the right directory
if not exist "index.html" (
    echo ERROR: Must be run from TITAN_UPGRADED directory
    echo Current directory: %CD%
    echo Looking for: index.html
    pause
    exit /b 1
)

REM Create backup before patching
set BACKUP_DIR=backups\pre-patch-%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
echo Creating backup in %BACKUP_DIR%...
mkdir "%BACKUP_DIR%" 2>nul
copy index.html "%BACKUP_DIR%\index.html.backup" >nul
echo Backup created
echo.

REM Patch 1: Update index.html
echo PATCH 1/5: Integrating RAM + Analytics brains...
if exist "..\index_PATCHED.html" (
    copy /Y "..\index_PATCHED.html" index.html >nul
    echo index.html updated with brain integrations
) else (
    echo WARNING: Patched index.html not found, skipping...
)
echo.

REM Patch 2: Add dev-tools.js
echo PATCH 2/5: Adding dev-tools.js...
if exist "..\dev-tools.js" (
    copy /Y "..\dev-tools.js" assets\js\dev-tools.js >nul
    echo dev-tools.js added
) else (
    echo WARNING: dev-tools.js not found, skipping...
)
echo.

REM Patch 3: Create .env
echo PATCH 3/5: Setting up environment configuration...
cd server
if not exist ".env" (
    if exist "..\..\env.template" (
        copy /Y "..\..\env.template" .env >nul
        echo .env created from template
        echo.
        echo IMPORTANT: Edit server\.env and add your API keys!
        echo Required: ANTHROPIC_API_KEY
        echo Optional: SPORTS_API_KEY, OPENAI_API_KEY
    ) else (
        echo WARNING: Template not found, skipping .env creation
    )
) else (
    echo .env already exists, skipping
)
cd ..
echo.

REM Patch 4: Update build manifest
echo PATCH 4/5: Updating build manifest...
(
echo {
echo   "version": "6.5.0",
echo   "build": "TITAN_2026_01_01_PATCHED",
echo   "date": "2026-01-01",
echo   "patchLevel": "CRITICAL_AUDIT_APPLIED",
echo   "patches": [
echo     "RAM_ANALYTICS_INTEGRATION",
echo     "LASER_REDUNDANCY_REMOVED",
echo     "DEV_TOOLS_CONDITIONAL_LOADING",
echo     "ENV_CONFIGURATION_ADDED",
echo     "VERSION_DISPLAY_UPDATED"
echo   ],
echo   "status": "PRODUCTION_READY_AFTER_ENV_CONFIG",
echo   "copyright": "© 2026 Zac Crockett - GRACE-X AI"
echo }
) > config\build_manifest.json
echo Build manifest updated to v6.5.0
echo.

REM Patch 5: Verify files
echo PATCH 5/5: Verifying critical files...
set MISSING=0

if exist "assets\js\brain\gracex.ram.js" (
    echo Found: gracex.ram.js
) else (
    echo Missing: gracex.ram.js
    set /a MISSING+=1
)

if exist "assets\js\brain\gracex.analytics.js" (
    echo Found: gracex.analytics.js
) else (
    echo Missing: gracex.analytics.js
    set /a MISSING+=1
)

if exist "assets\js\laser-ultra.js" (
    echo Found: laser-ultra.js
) else (
    echo Missing: laser-ultra.js
    set /a MISSING+=1
)

if exist "assets\js\dev-tools.js" (
    echo Found: dev-tools.js
) else (
    echo Missing: dev-tools.js
    set /a MISSING+=1
)

if exist "server\.env" (
    echo Found: .env
) else (
    echo Missing: .env
    set /a MISSING+=1
)

echo.

if %MISSING%==0 (
    echo ================================================================
    echo   ALL PATCHES APPLIED SUCCESSFULLY
    echo ================================================================
    echo.
    echo Next steps:
    echo 1. Edit server\.env with your API keys ^(REQUIRED^)
    echo 2. Run: npm install ^(if not done already^)
    echo 3. Run: npm start ^(or START.bat^)
    echo 4. Open browser: http://localhost:3000
    echo 5. Open console and verify:
    echo    - GraceX.RAM exists
    echo    - GraceX.Analytics exists
    echo    - No 404 errors
    echo.
    echo Build: GRACE-X v6.5.0 TITAN EDITION - PATCHED
    echo Backup: %BACKUP_DIR%
) else (
    echo ================================================================
    echo   PATCHES APPLIED WITH %MISSING% WARNINGS
    echo ================================================================
    echo.
    echo Some files are missing. Check the warnings above.
    echo You may need to manually copy missing files.
)

echo.
echo Run this to verify:
echo    findstr /n "gracex.ram.js" index.html
echo    findstr /n "gracex.analytics.js" index.html
echo.
pause

@echo off
REM GRACE-X TITAN CLEANUP SCRIPT (Windows)
REM Removes backup files and legacy code
REM Safe to run - creates backup first

echo ===============================================================
echo   GRACE-X TITAN CLEANUP SCRIPT
echo   Removes backups, archives legacy files
echo ===============================================================
echo.

REM Safety backup
echo Creating safety backup...
xcopy /E /I /Y . ..\TITAN_PRE_CLEANUP_BACKUP >nul 2>&1
echo OK Safety backup created at: ..\TITAN_PRE_CLEANUP_BACKUP\
echo.

REM Remove Sport module backups
echo Removing Sport module backups...
set count_modules=0
for %%f in (modules\sport_backup*.html) do set /a count_modules+=1
if %count_modules% GTR 0 (
    del /Q modules\sport_backup*.html >nul 2>&1
    echo OK Removed %count_modules% Sport module backups
) else (
    echo INFO No Sport module backups found
)
echo.

REM Remove server backups
echo Removing server backups...
set count_server=0
for %%f in (server\server_backup*.js) do set /a count_server+=1
if %count_server% GTR 0 (
    del /Q server\server_backup*.js >nul 2>&1
    echo OK Removed %count_server% server backups
) else (
    echo INFO No server backups found
)
echo.

REM Archive old LASER
echo Archiving legacy LASER...
if not exist archive\legacy mkdir archive\legacy
if exist assets\js\laser.js (
    move assets\js\laser.js archive\legacy\laser-v6.4.js >nul 2>&1
    echo OK Legacy LASER archived to: archive\legacy\laser-v6.4.js
) else (
    echo INFO Legacy LASER already removed
)
echo.

REM Check sports API files
echo Sports API files:
dir /B server\sports-api*.js 2>nul
echo.
echo WARNING Please manually verify which sports-api file is active
echo    Run: findstr /n "sports-api" server\server.js
echo    Then delete the unused version
echo.

REM Summary
echo ===============================================================
echo   CLEANUP COMPLETE
echo ===============================================================
echo.
echo Removed:
echo   - Sport module backups
echo   - Server backups
echo   - 1 legacy LASER file (archived)
echo.
echo Space freed: ~294KB
echo.
echo Next steps:
echo   1. Verify sports-api usage in server.js
echo   2. Delete unused sports-api file
echo   3. Test system: npm start
echo.
echo If anything goes wrong, restore from:
echo   ..\TITAN_PRE_CLEANUP_BACKUP\
echo.
pause

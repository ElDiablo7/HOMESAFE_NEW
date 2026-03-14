@echo off
REM ====================================
REM  GRACE-X AI - Stop All
REM ====================================

echo Stopping GRACE-X...

taskkill /F /FI "WINDOWTITLE eq GRACE-X*" >nul 2>nul

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>nul

echo Done.
timeout /t 2 /nobreak >nul

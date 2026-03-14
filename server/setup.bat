@echo off
REM GRACE-X Level 5 API Server Setup Script v2.0 (Windows)
echo.
echo ========================================================
echo   GRACE-X Level 5 API Server Setup v2.0
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js found: %NODE_VERSION%

echo.
echo [1/4] Installing production dependencies...
call npm install --omit=dev
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

echo.
echo [2/4] Installing development dependencies...
call npm install --save-dev nodemon eslint
echo [OK] Dev dependencies installed

echo.
echo [3/4] Setting up environment file...
if not exist .env (
    if exist env.example.txt (
        copy env.example.txt .env >nul
        echo [OK] Created .env file from template
        echo.
        echo ========================================================
        echo   IMPORTANT: Edit .env and add your API key!
        echo ========================================================
        echo.
        echo   Supported providers:
        echo   - OpenAI:     Get key at https://platform.openai.com/api-keys
        echo   - Anthropic:  Get key at https://console.anthropic.com/
        echo   - OpenRouter: Get key at https://openrouter.ai/keys
        echo   - Ollama:     Free local LLM - https://ollama.ai
        echo.
    ) else (
        echo [WARNING] env.example.txt not found
    )
) else (
    echo [OK] .env file already exists
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================================
echo   Next steps:
echo ========================================================
echo.
echo   1. Edit .env and configure your API provider/key
echo   2. Start the server:
echo      - Production:  npm start
echo      - Development: npm run dev
echo.
echo   3. Test the server:
echo      curl http://localhost:3000/health
echo.
pause

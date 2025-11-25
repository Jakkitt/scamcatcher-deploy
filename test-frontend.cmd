@echo off
REM ScamCatcher - Test Frontend
echo ========================================
echo   ScamCatcher Frontend Testing
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env not found - using defaults
    echo.
)

echo [INFO] Starting frontend dev server...
echo [INFO] Frontend will run on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev

@echo off
REM ScamCatcher - Test Backend Server
echo ========================================
echo   ScamCatcher Backend Testing
echo ========================================
echo.

REM Check if .env exists
if not exist "server\.env" (
    echo [ERROR] server\.env not found!
    echo Please copy server\.env.example to server\.env first
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting backend server...
echo [INFO] Server will run on http://localhost:4010
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd server
npm run dev

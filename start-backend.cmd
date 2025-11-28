@echo off
echo ========================================
echo Starting ScamCatcher Backend Server
echo ========================================
echo.

cd /d "%~dp0server"

echo Checking for node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo Backend will run on http://localhost:4000
echo.
call npm run dev

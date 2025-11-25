@echo off
echo ========================================
echo Starting ScamCatcher Frontend
echo ========================================
echo.

cd /d "%~dp0"

echo Checking for node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting frontend development server...
echo Frontend will run on http://localhost:5173
echo.
call npm run dev

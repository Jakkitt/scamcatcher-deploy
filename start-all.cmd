@echo off
echo ========================================
echo Starting ScamCatcher Application
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to continue...
pause > nul

cd /d "%~dp0"

echo.
echo Starting Backend Server...
start "ScamCatcher Backend" cmd /k "cd /d "%~dp0" && start-backend.cmd"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "ScamCatcher Frontend" cmd /k "cd /d "%~dp0" && start-frontend.cmd"

echo.
echo ========================================
echo Both servers are starting...
echo Check the new terminal windows for details
echo ========================================
echo.
pause

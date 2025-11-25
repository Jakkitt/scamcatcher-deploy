@echo off
REM Generate secure JWT_SECRET for production
echo ========================================
echo   JWT_SECRET Generator
echo ========================================
echo.
echo Generating 32-byte random secret...
echo.

node -e "console.log('Copy this to server/.env:'); console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'));"

echo.
echo ========================================
echo Remember to:
echo 1. Copy the JWT_SECRET line above
echo 2. Paste it into server/.env file
echo 3. Replace the old JWT_SECRET value
echo 4. Restart your server
echo ========================================
pause

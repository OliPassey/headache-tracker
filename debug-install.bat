@echo off
echo ================================================
echo    Debug Service Installation
echo ================================================
echo.

echo Testing Node.js...
node --version
echo Node.js exit code: %errorLevel%

echo.
echo Testing npm...
npm --version
echo npm exit code: %errorLevel%

echo.
echo Testing npm run build...
npm run build
echo Build exit code: %errorLevel%

echo.
echo Testing service manager...
if exist service-manager.js (
    echo [✓] service-manager.js exists
) else (
    echo [✗] service-manager.js missing
)

echo.
echo Debug complete.
pause

@echo off
echo ================================================
echo   Headache Tracker Windows Service Uninstaller
echo ================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Running with administrator privileges
) else (
    echo [✗] This script must be run as Administrator
    echo     Right-click and select "Run as administrator"
    pause
    exit /B 1
)

echo Stopping and uninstalling Headache Tracker service...
node service-manager.js uninstall

echo.
echo ================================================
echo Uninstallation complete!
echo.
echo The Headache Tracker service has been removed.
echo ================================================
pause

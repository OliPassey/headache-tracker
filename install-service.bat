@echo off
echo ================================================
echo    Headache Tracker Windows Service Installer
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

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] Node.js is installed
    node --version
) else (
    echo [✗] Node.js is not installed or not in PATH
    echo     Please install Node.js from https://nodejs.org/
    pause
    exit /B 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] npm is available
) else (
    echo [✗] npm is not available
    pause
    exit /B 1
)

echo.
echo Building application for production...
call npm run build
if %errorLevel% neq 0 (
    echo [✗] Build failed
    pause
    exit /B 1
)

echo.
echo Installing Windows service...
node service-manager.js install

echo.
echo ================================================
echo Installation complete!
echo.
echo The Headache Tracker service has been installed and started.
echo You can access it at: http://localhost:3000
echo.
echo Service Management Commands:
echo   Start:     node service-manager.js start
echo   Stop:      node service-manager.js stop
echo   Restart:   node service-manager.js restart
echo   Uninstall: node service-manager.js uninstall
echo.
echo The service will automatically start when Windows boots.
echo ================================================
pause

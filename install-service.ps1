# Headache Tracker Windows Service Installer (PowerShell)
# Run this script as Administrator

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Headache Tracker Windows Service Installer" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "[✓] Running with administrator privileges" -ForegroundColor Green
} else {
    Write-Host "[✗] This script must be run as Administrator" -ForegroundColor Red
    Write-Host "    Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "    Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
Write-Host ""
Write-Host "Checking npm availability..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    Write-Host "[✓] npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] npm is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build the application
Write-Host ""
Write-Host "Building application for production..." -ForegroundColor Yellow
try {
    & npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Build completed successfully" -ForegroundColor Green
    } else {
        Write-Host "[✗] Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "[✗] Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install the Windows service
Write-Host ""
Write-Host "Installing Windows service..." -ForegroundColor Yellow
try {
    & node service-manager.js install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Service installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[✗] Service installation failed with exit code $LASTEXITCODE" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "[✗] Service installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "The Headache Tracker service has been installed and started." -ForegroundColor White
Write-Host "You can access it at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Service Management Commands:" -ForegroundColor White
Write-Host "  Start:     node service-manager.js start" -ForegroundColor Gray
Write-Host "  Stop:      node service-manager.js stop" -ForegroundColor Gray
Write-Host "  Restart:   node service-manager.js restart" -ForegroundColor Gray
Write-Host "  Uninstall: node service-manager.js uninstall" -ForegroundColor Gray
Write-Host ""
Write-Host "The service will automatically start when Windows boots." -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"

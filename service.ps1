# Headache Tracker Service Management PowerShell Script
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("install", "uninstall", "start", "stop", "restart", "status")]
    [string]$Action = "status"
)

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Write-Header {
    param([string]$Title)
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host
}

function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    # Check administrator privileges
    if (-not (Test-Administrator)) {
        Write-Host "[✗] Administrator privileges required" -ForegroundColor Red
        Write-Host "    Please run PowerShell as Administrator" -ForegroundColor Red
        return $false
    }
    Write-Host "[✓] Running with administrator privileges" -ForegroundColor Green
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[✓] Node.js is installed: $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    } catch {
        Write-Host "[✗] Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "    Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[✓] npm is available: $npmVersion" -ForegroundColor Green
        } else {
            throw "npm not found"
        }
    } catch {
        Write-Host "[✗] npm is not available" -ForegroundColor Red
        return $false
    }
    
    return $true
}

function Get-ServiceStatus {
    try {
        $service = Get-Service -Name "Headache Tracker Service" -ErrorAction SilentlyContinue
        if ($service) {
            return $service.Status
        } else {
            return "Not Installed"
        }
    } catch {
        return "Not Installed"
    }
}

Write-Header "Headache Tracker Service Manager"

switch ($Action) {
    "install" {
        if (-not (Test-Prerequisites)) {
            exit 1
        }
        
        Write-Host "Building application for production..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[✗] Build failed" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Installing Windows service..." -ForegroundColor Yellow
        node service-manager.js install
        
        Write-Host
        Write-Host "Installation complete!" -ForegroundColor Green
        Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Cyan
    }
    
    "uninstall" {
        if (-not (Test-Administrator)) {
            Write-Host "[✗] Administrator privileges required" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Uninstalling service..." -ForegroundColor Yellow
        node service-manager.js uninstall
        Write-Host "Service uninstalled successfully!" -ForegroundColor Green
    }
    
    "start" {
        Write-Host "Starting service..." -ForegroundColor Yellow
        node service-manager.js start
    }
    
    "stop" {
        Write-Host "Stopping service..." -ForegroundColor Yellow
        node service-manager.js stop
    }
    
    "restart" {
        Write-Host "Restarting service..." -ForegroundColor Yellow
        node service-manager.js restart
    }
    
    "status" {
        $status = Get-ServiceStatus
        Write-Host "Service Status: " -NoNewline
        switch ($status) {
            "Running" { Write-Host $status -ForegroundColor Green }
            "Stopped" { Write-Host $status -ForegroundColor Yellow }
            "Not Installed" { Write-Host $status -ForegroundColor Red }
            default { Write-Host $status -ForegroundColor Gray }
        }
        
        if ($status -eq "Running") {
            Write-Host "Application available at: http://localhost:3000" -ForegroundColor Cyan
        }
    }
}

Write-Host
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  .\service.ps1 install    - Install and start the service" -ForegroundColor Gray
Write-Host "  .\service.ps1 uninstall  - Stop and remove the service" -ForegroundColor Gray
Write-Host "  .\service.ps1 start      - Start the service" -ForegroundColor Gray
Write-Host "  .\service.ps1 stop       - Stop the service" -ForegroundColor Gray
Write-Host "  .\service.ps1 restart    - Restart the service" -ForegroundColor Gray
Write-Host "  .\service.ps1 status     - Check service status" -ForegroundColor Gray

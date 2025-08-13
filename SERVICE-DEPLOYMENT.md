# Headache Tracker - Windows Service Deployment

This guide explains how to deploy the Headache Tracker as a Windows service that runs automatically on system startup.

## Prerequisites

- **Windows 10/11** or **Windows Server 2016+**
- **Node.js 16+** installed ([Download here](https://nodejs.org/))
- **Administrator privileges** for service installation

## Quick Installation

### Option 1: Batch Script (Easiest)
1. Right-click `install-service.bat`
2. Select **"Run as administrator"**
3. Follow the prompts

### Option 2: PowerShell Script
1. Open **PowerShell as Administrator**
2. Navigate to the application folder
3. Run: `.\service.ps1 install`

### Option 3: Manual Installation
1. Open **Command Prompt as Administrator**
2. Navigate to the application folder
3. Run: `npm run build`
4. Run: `npm run service:install`

## Service Management

### Using PowerShell (Recommended)
```powershell
# Check status
.\service.ps1 status

# Start service
.\service.ps1 start

# Stop service
.\service.ps1 stop

# Restart service
.\service.ps1 restart

# Uninstall service
.\service.ps1 uninstall
```

### Using npm scripts
```bash
# Install service
npm run service:install

# Start service
npm run service:start

# Stop service
npm run service:stop

# Restart service
npm run service:restart

# Uninstall service
npm run service:uninstall
```

### Using Windows Services Manager
1. Press `Win + R`, type `services.msc`
2. Find **"Headache Tracker Service"**
3. Right-click for options (Start, Stop, Restart, Properties)

## Access the Application

Once the service is running:
- **Local access**: http://localhost:3000
- **Network access**: http://YOUR-COMPUTER-IP:3000

To find your computer's IP address:
```cmd
ipconfig | findstr IPv4
```

## Service Features

- ✅ **Automatic startup** with Windows
- ✅ **Runs in background** without user login
- ✅ **Crash recovery** - automatically restarts if it fails
- ✅ **Windows Event Log** integration
- ✅ **Network accessible** from other devices
- ✅ **Secure** - data stays on your machine

## Firewall Configuration

To access from other devices on your network:

1. **Windows Defender Firewall**:
   - Open Windows Security → Firewall & network protection
   - Click "Allow an app through firewall"
   - Add Node.js or the specific port (3000)

2. **Command line** (Run as Administrator):
   ```cmd
   netsh advfirewall firewall add rule name="Headache Tracker" dir=in action=allow protocol=TCP localport=3000
   ```

## Troubleshooting

### Service won't start
1. Check Windows Event Viewer (Windows Logs → Application)
2. Verify Node.js is installed and in PATH
3. Ensure the application builds successfully: `npm run build`

### Can't access from network
1. Check firewall settings
2. Verify the service is running: `.\service.ps1 status`
3. Test local access first: http://localhost:3000

### Permission errors
1. Ensure you're running as Administrator
2. Check that Node.js has necessary permissions

### Port conflicts
If port 3000 is in use, you can change it:
1. Edit `server.js` and change the port variable
2. Or set environment variable: `SET PORT=3001`

## Logs and Monitoring

### Service Logs
- Windows Event Viewer → Applications and Services Logs
- Look for "Headache Tracker Service" entries

### Application Logs
- The service logs to Windows Event Log
- Console output available in Service Manager

## Data Location

Your headache tracking data is stored locally in:
- Browser Local Storage (per user)
- No data is sent to external servers
- Completely private and secure

## Uninstalling

### Quick Uninstall
1. Right-click `uninstall-service.bat`
2. Select **"Run as administrator"**

### Manual Uninstall
```powershell
.\service.ps1 uninstall
```

## Creating Portable Executable

To create a standalone .exe file (no Node.js required):

```bash
npm run package:portable
```

This creates `dist/headache-tracker.exe` that can run on any Windows machine.

## Security Notes

- The service runs on your local network only
- No data is transmitted to external servers
- All medical data stays on your computer
- Consider using HTTPS in production (requires additional setup)

## Advanced Configuration

### Custom Port
Edit `server.js` and change:
```javascript
const port = process.env.PORT || 3001; // Change 3000 to desired port
```

### Custom Hostname
Edit `server.js` and change:
```javascript
const hostname = process.env.HOSTNAME || '0.0.0.0'; // Listen on all interfaces
```

### Environment Variables
Create `.env.local` file:
```
PORT=3000
NODE_ENV=production
HOSTNAME=0.0.0.0
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Windows Event Logs
3. Verify all prerequisites are met

---

**Important**: This is a medical tracking application. Ensure you follow your organization's IT policies and data protection requirements when deploying.

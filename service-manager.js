const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'Headache Tracker Service',
  description: 'Personal headache tracking application web service',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    },
    {
      name: "PORT",
      value: "3000"
    }
  ]
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function() {
  console.log('Headache Tracker Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Listen for the "start" event and let users know the service is starting
svc.on('start', function() {
  console.log('Headache Tracker Service started successfully!');
  console.log('Application is now available at http://localhost:3000');
});

// Listen for the "stop" event and let users know the service is stopping
svc.on('stop', function() {
  console.log('Headache Tracker Service stopped.');
});

// Listen for the "uninstall" event and let users know the service has been removed
svc.on('uninstall', function() {
  console.log('Headache Tracker Service uninstalled successfully!');
});

// Check if we're being called to install, uninstall, start, or stop
const action = process.argv[2];

switch(action) {
  case 'install':
    console.log('Installing Headache Tracker Service...');
    svc.install();
    break;
  
  case 'uninstall':
    console.log('Uninstalling Headache Tracker Service...');
    svc.uninstall();
    break;
  
  case 'start':
    console.log('Starting Headache Tracker Service...');
    svc.start();
    break;
  
  case 'stop':
    console.log('Stopping Headache Tracker Service...');
    svc.stop();
    break;
  
  case 'restart':
    console.log('Restarting Headache Tracker Service...');
    svc.restart();
    break;
  
  default:
    console.log('Headache Tracker Service Manager');
    console.log('Usage: node service-manager.js [install|uninstall|start|stop|restart]');
    console.log('');
    console.log('Commands:');
    console.log('  install   - Install the service');
    console.log('  uninstall - Remove the service');
    console.log('  start     - Start the service');
    console.log('  stop      - Stop the service');
    console.log('  restart   - Restart the service');
    break;
}

module.exports = svc;

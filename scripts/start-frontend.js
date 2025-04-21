const { spawn } = require('child_process');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const net = require('net');

// Make sure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  console.log('Data directory not found, creating...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Path to the database
const dbPath = path.join(__dirname, '../data/m3u-downloader.db');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(false);
      } else {
        // Some other error occurred
        console.error(`Error checking port ${port}:`, err);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Port is available, close the server and return true
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

// Function to find an available port starting from the provided one
async function findAvailablePort(startPort) {
  let port = startPort;
  // Try ports from startPort to startPort + 20
  for (let i = 0; i < 20; i++) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      return port;
    }
    console.log(`Port ${port} is already in use, trying next port...`);
    port++;
  }
  
  // If no port was found after 20 attempts, return a random port between 3002-9000
  const randomPort = Math.floor(Math.random() * 5998) + 3002;
  console.log(`Could not find an available port after 20 attempts, using random port ${randomPort}`);
  return randomPort;
}

async function startFrontend() {
  try {
    console.log('Opening database at:', dbPath);
    
    // Check if database file exists, if not create empty file
    if (!fs.existsSync(dbPath)) {
      console.log('Database file not found, using default port 3000');
      const availablePort = await findAvailablePort(3000);
      startViteWithPort(availablePort);
      return;
    }
    
    // Open the database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Try to get settings from the database
    try {
      const settings = await db.get('SELECT webui_port FROM settings WHERE id = 1');
      let port = settings ? settings.webui_port : 3000;
      
      // If the port is 3001 (same as backend), change it to 3000
      if (port === 3001) {
        console.log('Frontend port is set to 3001, which is the same as the backend port.');
        console.log('Changing to 3000 to avoid conflict...');
        port = 3000;
        
        // Update the database with the new port
        await db.run('UPDATE settings SET webui_port = ? WHERE id = 1', [port]);
        console.log('Updated database with new port 3000');
      }
      
      // Check if the port is available
      if (!(await isPortAvailable(port))) {
        console.log(`Port ${port} is already in use. Finding an available port...`);
        port = await findAvailablePort(port + 1);
        console.log(`Found available port: ${port}`);
      }
      
      console.log(`Starting frontend on port ${port}`);
      startViteWithPort(port);
    } catch (error) {
      console.log('Error reading settings, using default port 3000:', error.message);
      const availablePort = await findAvailablePort(3000);
      startViteWithPort(availablePort);
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Failed to start frontend:', error);
    console.log('Falling back to default port 3000');
    const availablePort = await findAvailablePort(3000);
    startViteWithPort(availablePort);
  }
}

function startViteWithPort(port) {
  console.log(`Starting Vite dev server on port ${port}...`);
  
  try {
    // Set the environment variable for the frontend port
    const env = { ...process.env, FRONTEND_PORT: port.toString() };
    
    // Path to Vite executable in node_modules
    const frontendDir = path.join(__dirname, '../frontend');
    const viteExecutable = path.join(frontendDir, 'node_modules', '.bin', 'vite');
    
    // Check if vite executable exists
    if (fs.existsSync(viteExecutable)) {
      console.log(`Found Vite executable at: ${viteExecutable}`);
      
      // Start vite directly instead of through npm
      const vite = spawn(viteExecutable, [], { 
        cwd: frontendDir,
        env,
        stdio: 'inherit',
        shell: true  // Use shell to improve compatibility across platforms
      });
      
      vite.on('error', (error) => {
        console.error('Failed to start Vite dev server:', error);
      });
    } else {
      console.log('Vite executable not found, attempting to use npx');
      
      // Try using npx as fallback
      const npx = spawn('npx', ['vite'], { 
        cwd: frontendDir,
        env,
        stdio: 'inherit',
        shell: true
      });
      
      npx.on('error', (error) => {
        console.error('Failed to start Vite with npx:', error);
        console.error('Please make sure you have run npm install in the frontend directory');
      });
    }
  } catch (error) {
    console.error('Error starting Vite dev server:', error);
  }
}

// Run the function
startFrontend(); 
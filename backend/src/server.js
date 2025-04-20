// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { initDatabase } = require('./utils/database');
const logger = require('./utils/logger');
const { startWatchlistService } = require('./services/watchlistService');
const fs = require('fs');

// Create downloads directory if it doesn't exist
const DEFAULT_DOWNLOAD_PATH = path.join(__dirname, '../../downloads');
if (!fs.existsSync(DEFAULT_DOWNLOAD_PATH)) {
  fs.mkdirSync(DEFAULT_DOWNLOAD_PATH, { recursive: true });
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set proper MIME types for JavaScript files
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.jsx')) {
    res.type('application/javascript');
  }
  next();
});

// For production: serve the built frontend
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build directory
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // Serve frontend for any other route in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
} else {
  // In development, we only need to serve the API routes
  // The frontend will be served by Vite's dev server
  logger.info('Running in development mode - API only');
}

// API routes
app.use('/api', routes);

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    
    // Start watchlist service for automatic downloads
    startWatchlistService();
  });
}).catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
// backend/src/utils/database.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const logger = require('./logger');

let db;

const DEFAULT_SETTINGS = {
  download_path: path.join(__dirname, '../../downloads'),
  webui_port: 3000,
  watchlist_refresh_rate: 60,
};

const initDatabase = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, '../../../data/m3u-downloader.db'),
      driver: sqlite3.Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        download_path TEXT NOT NULL,
        webui_port INTEGER NOT NULL,
        watchlist_refresh_rate INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        download_path TEXT
      );
      
      CREATE TABLE IF NOT EXISTS m3u_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        name TEXT,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        file_path TEXT NOT NULL,
        size INTEGER,
        status TEXT NOT NULL,
        progress REAL DEFAULT 0,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        m3u_link_id INTEGER,
        FOREIGN KEY (m3u_link_id) REFERENCES m3u_links (id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        series_id TEXT NOT NULL,
        last_episode TEXT,
        added_at INTEGER NOT NULL
      );
    `);
    
    // Insert default settings if they don't exist
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    // Insert default settings if the table is empty
    const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
      await db.run(
        'INSERT INTO settings (id, download_path, webui_port, watchlist_refresh_rate) VALUES (?, ?, ?, ?)',
        [1, DEFAULT_SETTINGS.download_path, DEFAULT_SETTINGS.webui_port, DEFAULT_SETTINGS.watchlist_refresh_rate]
      );
      logger.info('Inserted default settings.');
    }
    
    // Insert default categories if the table is empty
    const categoryCount = await db.get('SELECT COUNT(*) as count FROM categories');
    if (categoryCount.count === 0) {
      // Get default download path from settings
      const settings = await db.get('SELECT download_path FROM settings WHERE id = 1');
      const basePath = settings ? settings.download_path : DEFAULT_SETTINGS.download_path;
      
      // Create default paths for TV Shows and Movies
      const tvShowsPath = path.join(basePath, 'TV Shows');
      const moviesPath = path.join(basePath, 'Movies');
      
      await db.run("INSERT INTO categories (name, download_path) VALUES ('TV Shows', ?)", [tvShowsPath]);
      await db.run("INSERT INTO categories (name, download_path) VALUES ('Movies', ?)", [moviesPath]);
      logger.info('Inserted default categories with download paths.');
    } else {
      // Check if we need to add download_path to existing categories
      try {
        await db.get('SELECT download_path FROM categories LIMIT 1');
      } catch (error) {
        if (error.message.includes('no such column')) {
          // Column doesn't exist, add it
          logger.info('Adding download_path column to existing categories table');
          await db.exec('ALTER TABLE categories ADD COLUMN download_path TEXT');
          
          // Get default download path from settings
          const settings = await db.get('SELECT download_path FROM settings WHERE id = 1');
          const basePath = settings ? settings.download_path : DEFAULT_SETTINGS.download_path;
          
          // Update existing categories with default paths
          const categories = await db.all('SELECT id, name FROM categories');
          for (const category of categories) {
            const categoryPath = path.join(basePath, category.name);
            await db.run('UPDATE categories SET download_path = ? WHERE id = ?', [categoryPath, category.id]);
          }
          
          logger.info('Updated existing categories with default download paths');
        }
      }
    }
    
    logger.info('Database initialized successfully');
    return db;
  } catch (err) {
    logger.error('Database initialization failed:', err);
    throw err;
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = { initDatabase, getDb, DEFAULT_SETTINGS };

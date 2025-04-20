// backend/src/controllers/watchlistController.js
const { getDb } = require('../utils/database');
const logger = require('../utils/logger');

exports.getWatchlist = async (req, res) => {
  try {
    const db = getDb();
    const watchlist = await db.all('SELECT * FROM watchlist ORDER BY added_at DESC');
    res.json(watchlist);
  } catch (error) {
    logger.error('Error getting watchlist:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const { title, series_id, last_episode } = req.body;
    
    if (!title || !series_id) {
      return res.status(400).json({ error: 'Title and series ID are required' });
    }
    
    const db = getDb();
    
    // Check if series already exists in watchlist
    const existing = await db.get('SELECT * FROM watchlist WHERE series_id = ?', [series_id]);
    
    if (existing) {
      return res.status(409).json({ error: 'Series already in watchlist' });
    }
    
    const result = await db.run(
      'INSERT INTO watchlist (title, series_id, last_episode, added_at) VALUES (?, ?, ?, ?)',
      [title, series_id, last_episode || null, Date.now()]
    );
    
    const newItem = await db.get('SELECT * FROM watchlist WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newItem);
  } catch (error) {
    logger.error('Error adding to watchlist:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const item = await db.get('SELECT * FROM watchlist WHERE id = ?', [id]);
    
    if (!item) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }
    
    await db.run('DELETE FROM watchlist WHERE id = ?', [id]);
    
    res.json({ message: 'Item removed from watchlist successfully' });
  } catch (error) {
    logger.error('Error removing from watchlist:', error);
    res.status(500).json({ error: error.message });
  }
};
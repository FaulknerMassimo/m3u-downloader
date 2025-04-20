// backend/src/routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('./controllers/categoryController');
const downloadController = require('./controllers/downloadController');
const m3uController = require('./controllers/m3uController');
const searchController = require('./controllers/searchController');
const watchlistController = require('./controllers/watchlistController');
const systemController = require('./controllers/systemController');

// Category routes
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// M3U links routes
router.get('/m3u-links', m3uController.getAllM3uLinks);
router.get('/m3u-links/:categoryId', m3uController.getM3uLinksByCategory);
router.post('/m3u-links', m3uController.createM3uLink);
router.put('/m3u-links/:id', m3uController.updateM3uLink);
router.delete('/m3u-links/:id', m3uController.deleteM3uLink);

// Search routes
router.get('/search', searchController.search);
router.get('/series/:seriesId/episodes', searchController.getEpisodes);

// Download routes
router.get('/downloads', downloadController.getAllDownloads);
router.get('/downloads/active', downloadController.getActiveDownloads);
router.get('/downloads/history', downloadController.getDownloadHistory);
router.post('/download', downloadController.startDownload);
router.delete('/downloads/:id', downloadController.cancelDownload);

// Watchlist routes
router.get('/watchlist', watchlistController.getWatchlist);
router.post('/watchlist', watchlistController.addToWatchlist);
router.delete('/watchlist/:id', watchlistController.removeFromWatchlist);

// Settings routes
router.get('/settings', async (req, res) => {
  const { getDb } = require('./utils/database');
  const db = getDb();
  
  try {
    const settings = await db.get('SELECT * FROM settings WHERE id = 1');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  const { getDb } = require('./utils/database');
  const db = getDb();
  const { download_path, webui_port, watchlist_refresh_rate } = req.body;
  
  try {
    await db.run(
      'UPDATE settings SET download_path = ?, webui_port = ?, watchlist_refresh_rate = ? WHERE id = 1',
      [download_path, webui_port, watchlist_refresh_rate]
    );
    
    const updatedSettings = await db.get('SELECT * FROM settings WHERE id = 1');
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System routes
router.post('/reset', systemController.resetApplication);

module.exports = router;

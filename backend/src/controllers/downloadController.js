// backend/src/controllers/downloadController.js
const { getDb } = require('../utils/database');
const { startDownload, cancelDownload, getDownloadStatus } = require('../services/downloadService');
const logger = require('../utils/logger');

exports.getAllDownloads = async (req, res) => {
  try {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      ORDER BY d.start_time DESC
    `);
    
    // Add current progress information for active downloads
    for (const download of downloads) {
      if (download.status === 'downloading') {
        const status = getDownloadStatus(download.id);
        if (status) {
          download.progress = status.progress;
          download.speed = status.speed;
          download.eta = status.eta;
        }
      }
    }
    
    res.json(downloads);
  } catch (error) {
    logger.error('Error getting downloads:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveDownloads = async (req, res) => {
  try {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      WHERE d.status = 'downloading'
      ORDER BY d.start_time DESC
    `);
    
    // Add current progress information
    for (const download of downloads) {
      const status = getDownloadStatus(download.id);
      if (status) {
        download.progress = status.progress;
        download.speed = status.speed;
        download.eta = status.eta;
      }
    }
    
    res.json(downloads);
  } catch (error) {
    logger.error('Error getting active downloads:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDownloadHistory = async (req, res) => {
  try {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      WHERE d.status != 'downloading'
      ORDER BY d.start_time DESC
    `);
    
    res.json(downloads);
  } catch (error) {
    logger.error('Error getting download history:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.startDownload = async (req, res) => {
  try {
    const { url, title, m3u_link_id } = req.body;
    
    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }
    
    const db = getDb();
    const settings = await db.get('SELECT download_path FROM settings WHERE id = 1');
    
    const downloadId = await startDownload({
      url,
      title,
      m3u_link_id,
      downloadPath: settings.download_path
    });
    
    const download = await db.get('SELECT * FROM downloads WHERE id = ?', [downloadId]);
    
    res.status(201).json(download);
  } catch (error) {
    logger.error('Error starting download:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelDownload = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await cancelDownload(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Download not found or already completed' });
    }
    
    res.json({ message: 'Download cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling download:', error);
    res.status(500).json({ error: error.message });
  }
};

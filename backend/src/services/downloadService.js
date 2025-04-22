// backend/src/services/downloadService.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getDb } = require('../utils/database');
const logger = require('../utils/logger');

// Store active downloads
const activeDownloads = new Map();

exports.startDownload = async ({ url, title, m3u_link_id, downloadPath }) => {
  const db = getDb();
  
  let finalDownloadPath = downloadPath;
  let categoryId = null;
  let useSeriesFolders = false;
  
  // If m3u_link_id is provided, get category-specific download path
  if (m3u_link_id) {
    try {
      // Get the category ID for this m3u link
      const m3uLink = await db.get('SELECT category_id FROM m3u_links WHERE id = ?', [m3u_link_id]);
      
      if (m3uLink && m3uLink.category_id) {
        categoryId = m3uLink.category_id;
        
        // Get the category-specific download path and series folder setting
        const category = await db.get('SELECT download_path, use_series_folders, name FROM categories WHERE id = ?', [categoryId]);
        
        if (category && category.download_path) {
          finalDownloadPath = category.download_path;
          useSeriesFolders = category.use_series_folders === 1;
          logger.info(`Using category-specific download path: ${finalDownloadPath}`);
          
          // Check if we should use series folders for TV Shows
          if (useSeriesFolders && category.name === 'TV Shows') {
            const seriesName = extractSeriesName(title);
            if (seriesName) {
              // Create a safe folder name for the series
              const safeFolderName = seriesName.replace(/[^a-z0-9]/gi, ' ').trim().replace(/\s+/g, '_');
              finalDownloadPath = path.join(finalDownloadPath, safeFolderName);
              logger.info(`Using series folder for download: ${finalDownloadPath}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error getting category download path:', error);
      // Continue with default download path
    }
  }
  
  // Create a safe filename
  const safeTitle = title.replace(/[^a-z0-9.]/gi, '_');
  const fileExt = path.extname(url) || determineExtension(url) || '.mp4';
  const fileName = `${safeTitle}${fileExt}`;
  const filePath = path.join(finalDownloadPath, fileName);
  
  // Create download record
  const result = await db.run(`
    INSERT INTO downloads 
    (title, file_path, status, start_time, m3u_link_id) 
    VALUES (?, ?, ?, ?, ?)
  `, [title, filePath, 'downloading', Date.now(), m3u_link_id || null]);
  
  const downloadId = result.lastID;
  
  // Start download process
  startDownloadProcess(downloadId, url, filePath);
  
  return downloadId;
};

// Helper function to extract series name from title
function extractSeriesName(title) {
  // Pattern: Series name - SxxExx - Episode title
  const seriesTitleMatch = title.match(/^(.+?)[-–—]\s*S\d+/i);
  if (seriesTitleMatch) {
    return seriesTitleMatch[1].trim();
  }
  
  // Alternative pattern: Series name - Episode title
  const simpleSeriesTitleMatch = title.match(/^(.+?)[-–—]/);
  if (simpleSeriesTitleMatch) {
    return simpleSeriesTitleMatch[1].trim();
  }
  
  return null;
}

exports.cancelDownload = async (downloadId) => {
  const download = activeDownloads.get(parseInt(downloadId, 10));
  
  if (!download) {
    return false;
  }
  
  // Cancel the download
  if (download.cancelTokenSource) {
    download.cancelTokenSource.cancel('Download cancelled by user');
  }
  
  // Update database
  const db = getDb();
  await db.run(
    'UPDATE downloads SET status = ?, end_time = ? WHERE id = ?',
    ['cancelled', Date.now(), downloadId]
  );
  
  // Clean up
  activeDownloads.delete(parseInt(downloadId, 10));
  
  // Delete the partial file
  try {
    if (fs.existsSync(download.filePath)) {
      fs.unlinkSync(download.filePath);
    }
  } catch (error) {
    logger.error(`Error deleting partial file for download ${downloadId}:`, error);
  }
  
  return true;
};

exports.getDownloadStatus = (downloadId) => {
  const download = activeDownloads.get(parseInt(downloadId, 10));
  return download ? { 
    progress: download.progress,
    speed: download.speed,
    eta: download.eta,
    bytesDownloaded: download.bytesDownloaded,
    totalBytes: download.totalBytes
  } : null;
};

const startDownloadProcess = async (downloadId, url, filePath) => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
  // Initialize download status
  activeDownloads.set(parseInt(downloadId, 10), {
    progress: 0,
    speed: 0,
    eta: 0,
    filePath,
    cancelTokenSource: source,
    startTime: Date.now(),
    bytesDownloaded: 0,
    totalBytes: 0
  });
  
  try {
    // Make sure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Start downloading
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      cancelToken: source.token,
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
    
    // Update total bytes in the active downloads map
    const download = activeDownloads.get(parseInt(downloadId, 10));
    if (download) {
      download.totalBytes = totalBytes;
    }
    
    const writer = fs.createWriteStream(filePath);
    let downloadedBytes = 0;
    const intervals = [];
    
    const updateInterval = setInterval(() => {
      const download = activeDownloads.get(parseInt(downloadId, 10));
      if (!download) {
        clearInterval(updateInterval);
        return;
      }
      
      const currentTime = Date.now();
      const elapsed = (currentTime - download.startTime) / 1000; // in seconds
      const speed = downloadedBytes / elapsed; // bytes per second
      
      let eta = 0;
      if (speed > 0 && totalBytes > 0) {
        eta = Math.round((totalBytes - downloadedBytes) / speed);
      }
      
      // Update download status
      download.progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) / 100 : 0;
      download.speed = Math.round(speed / 1024); // KB/s
      download.eta = eta;
      download.bytesDownloaded = downloadedBytes;
      
      // Update database
      updateDownloadProgress(downloadId, download.progress, downloadedBytes);
      
      // Keep only last 10 intervals for speed calculation
      intervals.push({
        time: currentTime,
        bytes: downloadedBytes
      });
      
      if (intervals.length > 10) {
        intervals.shift();
      }
    }, 1000);
    
    response.data.on('data', (chunk) => {
      downloadedBytes += chunk.length;
    });
    
    response.data.pipe(writer);
    
    writer.on('finish', async () => {
      clearInterval(updateInterval);
      
      // Download completed
      const db = getDb();
      await db.run(
        'UPDATE downloads SET status = ?, end_time = ?, size = ?, progress = 1 WHERE id = ?',
        ['completed', Date.now(), downloadedBytes, downloadId]
      );
      
      activeDownloads.delete(parseInt(downloadId, 10));
      logger.info(`Download completed: ${filePath}`);
    });
    
    writer.on('error', async (error) => {
      clearInterval(updateInterval);
      
      // Download failed
      logger.error(`Download error for ${filePath}:`, error);
      
      const db = getDb();
      await db.run(
        'UPDATE downloads SET status = ?, end_time = ? WHERE id = ?',
        ['failed', Date.now(), downloadId]
      );
      
      activeDownloads.delete(parseInt(downloadId, 10));
    });
  } catch (error) {
    if (axios.isCancel(error)) {
      logger.info(`Download cancelled: ${downloadId}`);
    } else {
      logger.error(`Download error for ${downloadId}:`, error);
      
      // Update database
      const db = getDb();
      await db.run(
        'UPDATE downloads SET status = ?, end_time = ? WHERE id = ?',
        ['failed', Date.now(), downloadId]
      );
      
      activeDownloads.delete(parseInt(downloadId, 10));
    }
  }
};

const updateDownloadProgress = async (downloadId, progress, bytesDownloaded) => {
  try {
    const db = getDb();
    await db.run(
      'UPDATE downloads SET progress = ?, size = ? WHERE id = ?',
      [progress, bytesDownloaded, downloadId]
    );
  } catch (error) {
    logger.error(`Error updating download progress for ${downloadId}:`, error);
  }
};

const determineExtension = (url) => {
  // Try to determine file extension from URL
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const ext = path.extname(pathname);
  
  if (ext) {
    return ext;
  }
  
  // Check common video formats in URL
  const videoFormats = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.wmv'];
  for (const format of videoFormats) {
    if (url.includes(format)) {
      return format;
    }
  }
  
  return '.mp4'; // Default to mp4
};
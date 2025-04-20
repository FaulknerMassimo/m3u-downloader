// backend/src/services/watchlistService.js
const { getDb } = require('../utils/database');
const { parseM3u } = require('./m3uParserService');
const { startDownload } = require('./downloadService');
const logger = require('../utils/logger');

let watchlistInterval;

exports.startWatchlistService = async () => {
  const db = getDb();
  const settings = await db.get('SELECT watchlist_refresh_rate FROM settings WHERE id = 1');
  const refreshRate = settings.watchlist_refresh_rate || 60; // Default to 60 minutes
  
  // Clear any existing interval
  if (watchlistInterval) {
    clearInterval(watchlistInterval);
  }
  
  // Initial check
  await checkWatchlistForNewEpisodes();
  
  // Set up interval for periodic checks
  watchlistInterval = setInterval(checkWatchlistForNewEpisodes, refreshRate * 60 * 1000);
  
  logger.info(`Watchlist service started with refresh rate of ${refreshRate} minutes`);
};

const checkWatchlistForNewEpisodes = async () => {
  try {
    logger.info('Checking watchlist for new episodes...');
    
    const db = getDb();
    
    // Get all watchlist items
    const watchlistItems = await db.all('SELECT * FROM watchlist');
    
    if (watchlistItems.length === 0) {
      return;
    }
    
    // Get all M3U links
    const m3uLinks = await db.all('SELECT * FROM m3u_links');
    
    if (m3uLinks.length === 0) {
      return;
    }
    
    // Get download path from settings
    const settings = await db.get('SELECT download_path FROM settings WHERE id = 1');
    
    // Process each M3U link
    for (const link of m3uLinks) {
      try {
        const m3uData = await parseM3u(link.url);
        
        // Check each watchlist item against the M3U data
        for (const item of watchlistItems) {
          const seriesName = Buffer.from(item.series_id, 'base64').toString();
          
          // Find matching episodes for this series
          const episodes = m3uData.filter(episode => 
            (episode.seriesName && episode.seriesName.toLowerCase() === seriesName.toLowerCase()) ||
            (!episode.seriesName && episode.title.toLowerCase() === seriesName.toLowerCase())
          );
          
          if (episodes.length === 0) {
            continue;
          }
          
          // Sort episodes by season and episode
          episodes.sort((a, b) => {
            if (a.season !== b.season) {
              return a.season - b.season;
            }
            return a.episode - b.episode;
          });
          
          // Find the latest episode
          const latestEpisode = episodes[episodes.length - 1];
          
          // Check if this is a new episode
          if (!item.last_episode || isNewerEpisode(latestEpisode, item.last_episode)) {
            // Start download for new episode
            await startDownload({
              url: latestEpisode.url,
              title: latestEpisode.title,
              m3u_link_id: link.id,
              downloadPath: settings.download_path
            });
            
            // Update watchlist item with latest episode
            await db.run(
              'UPDATE watchlist SET last_episode = ? WHERE id = ?',
              [serializeEpisode(latestEpisode), item.id]
            );
            
            logger.info(`New episode found and download started: ${latestEpisode.title}`);
          }
        }
      } catch (error) {
        logger.error(`Error processing M3U link ${link.url}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error checking watchlist for new episodes:', error);
  }
};

const isNewerEpisode = (episode, lastEpisodeStr) => {
  if (!lastEpisodeStr) {
    return true;
  }
  
  try {
    const lastEpisode = JSON.parse(lastEpisodeStr);
    
    if (episode.season > lastEpisode.season) {
      return true;
    }
    
    if (episode.season === lastEpisode.season && episode.episode > lastEpisode.episode) {
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error parsing last episode:', error);
    return true; // Assume it's new if we can't parse the last episode
  }
};

const serializeEpisode = (episode) => {
  return JSON.stringify({
    id: episode.id,
    title: episode.title,
    season: episode.season,
    episode: episode.episode
  });
};
// backend/src/controllers/searchController.js
const { getDb } = require('../utils/database');
const { parseM3u } = require('../services/m3uParserService');
const logger = require('../utils/logger');

exports.search = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const db = getDb();
    let m3uLinks;
    
    if (category) {
      m3uLinks = await db.all(`
        SELECT m.* FROM m3u_links m
        JOIN categories c ON m.category_id = c.id
        WHERE c.name = ? OR c.id = ?
      `, [category, category]);
    } else {
      m3uLinks = await db.all('SELECT * FROM m3u_links');
    }
    
    if (m3uLinks.length === 0) {
      return res.json({ results: [] });
    }
    
    // Process all M3U links and search for the query
    const searchResults = {};
    
    for (const link of m3uLinks) {
      try {
        const m3uData = await parseM3u(link.url);
        
        // Group shows/movies and their episodes
        m3uData.forEach(item => {
          const title = item.title.toLowerCase();
          const seriesName = item.seriesName ? item.seriesName.toLowerCase() : title;
          
          if (seriesName.includes(query.toLowerCase())) {
            if (!searchResults[seriesName]) {
              searchResults[seriesName] = {
                id: Buffer.from(seriesName).toString('base64'),
                title: item.seriesName || item.title,
                type: item.seriesName ? 'series' : 'movie',
                episodes: [],
                source: link.id
              };
            }
            
            if (item.seriesName) {
              searchResults[seriesName].episodes.push({
                id: item.id,
                title: item.title,
                url: item.url,
                season: item.season,
                episode: item.episode
              });
            } else {
              searchResults[seriesName].url = item.url;
            }
          }
        });
      } catch (error) {
        logger.error(`Error parsing M3U from ${link.url}:`, error);
      }
    }
    
    res.json({
      results: Object.values(searchResults)
    });
  } catch (error) {
    logger.error('Error searching:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getEpisodes = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const seriesName = Buffer.from(seriesId, 'base64').toString();
    
    const db = getDb();
    const m3uLinks = await db.all('SELECT * FROM m3u_links');
    
    // Find all episodes for the series
    const episodes = [];
    
    for (const link of m3uLinks) {
      try {
        const m3uData = await parseM3u(link.url);
        
        m3uData.forEach(item => {
          if (
            (item.seriesName && item.seriesName.toLowerCase() === seriesName.toLowerCase()) ||
            (!item.seriesName && item.title.toLowerCase() === seriesName.toLowerCase())
          ) {
            episodes.push({
              id: item.id,
              title: item.title,
              url: item.url,
              season: item.season,
              episode: item.episode,
              source: link.id
            });
          }
        });
      } catch (error) {
        logger.error(`Error parsing M3U from ${link.url}:`, error);
      }
    }
    
    // Sort episodes by season and episode
    episodes.sort((a, b) => {
      if (a.season !== b.season) {
        return a.season - b.season;
      }
      return a.episode - b.episode;
    });
    
    res.json({ episodes });
  } catch (error) {
    logger.error('Error getting episodes:', error);
    res.status(500).json({ error: error.message });
  }
};
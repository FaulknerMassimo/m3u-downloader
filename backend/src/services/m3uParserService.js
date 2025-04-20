// backend/src/services/m3uParserService.js
const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

exports.parseM3u = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const content = response.data;
    
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid M3U content');
    }
    
    const lines = content.split('\n');
    const items = [];
    let currentItem = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse the attributes
        currentItem = {
          title: '',
          url: '',
          id: '',
          seriesName: null,
          season: null,
          episode: null
        };
        
        // Extract title
        const titleMatch = line.match(/,(.+)$/);
        if (titleMatch && titleMatch[1]) {
          currentItem.title = titleMatch[1].trim();
          
          // Try to extract series name, season and episode
          const tvShowMatch = currentItem.title.match(/^(.+?)[ .]S(\d+)[ .]?E(\d+)/i);
          if (tvShowMatch) {
            currentItem.seriesName = tvShowMatch[1].trim();
            currentItem.season = parseInt(tvShowMatch[2], 10);
            currentItem.episode = parseInt(tvShowMatch[3], 10);
          }
        }
      } else if (line && !line.startsWith('#') && currentItem) {
        // This is a URL
        currentItem.url = line;
        
        // Generate a unique ID for the item
        currentItem.id = crypto.createHash('md5').update(currentItem.url).digest('hex');
        
        items.push(currentItem);
        currentItem = null;
      }
    }
    
    return items;
  } catch (error) {
    logger.error(`Error parsing M3U from ${url}:`, error);
    throw error;
  }
};
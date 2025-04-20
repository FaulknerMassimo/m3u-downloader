// frontend/src/services/formatters.js

/**
 * Format file size to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date to human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Format download speed to human-readable format
 * @param {number} bytesPerSecond - Speed in bytes per second
 * @returns {string} Formatted speed
 */
export const formatSpeed = (bytesPerSecond) => {
  return formatFileSize(bytesPerSecond) + '/s';
};

/**
 * Format time in seconds to human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Format progress as percentage
 * @param {number} progress - Progress as decimal (0-1)
 * @returns {string} Formatted progress
 */
export const formatProgress = (progress) => {
  return `${Math.round(progress * 100)}%`;
};

/**
 * Format episode number
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} Formatted episode number
 */
export const formatEpisode = (season, episode) => {
  if (!season && !episode) return '';
  
  if (season && episode) {
    return `S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
  } else if (season) {
    return `Season ${season}`;
  } else {
    return `Episode ${episode}`;
  }
};

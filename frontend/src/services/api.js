// frontend/src/services/api.js
import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Categories
export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// M3U Links
export const fetchM3uLinks = async () => {
  try {
    const response = await api.get('/m3u-links');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch M3U links:', error);
    return [];
  }
};

export const fetchM3uLinksByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/m3u-links/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch M3U links for category ${categoryId}:`, error);
    return [];
  }
};

export const createM3uLink = async (linkData) => {
  const response = await api.post('/m3u-links', linkData);
  return response.data;
};

export const updateM3uLink = async (id, linkData) => {
  const response = await api.put(`/m3u-links/${id}`, linkData);
  return response.data;
};

export const deleteM3uLink = async (id) => {
  const response = await api.delete(`/m3u-links/${id}`);
  return response.data;
};

// Search
export const searchContent = async (query, categoryId = null) => {
  try {
    const params = { query };
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await api.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    return { results: [] };
  }
};

export const getEpisodes = async (seriesId) => {
  try {
    const response = await api.get(`/series/${seriesId}/episodes`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch episodes for series ${seriesId}:`, error);
    return [];
  }
};

// Downloads
export const fetchAllDownloads = async () => {
  try {
    const response = await api.get('/downloads');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all downloads:', error);
    return [];
  }
};

export const fetchActiveDownloads = async () => {
  try {
    const response = await api.get('/downloads/active');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active downloads:', error);
    return [];
  }
};

export const fetchDownloadHistory = async () => {
  try {
    const response = await api.get('/downloads/history');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch download history:', error);
    return [];
  }
};

export const startDownload = async (downloadData) => {
  const response = await api.post('/download', downloadData);
  return response.data;
};

export const cancelDownload = async (id) => {
  const response = await api.delete(`/downloads/${id}`);
  return response.data;
};

// Watchlist
export const fetchWatchlist = async () => {
  try {
    const response = await api.get('/watchlist');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch watchlist:', error);
    return [];
  }
};

export const addToWatchlist = async (watchlistData) => {
  const response = await api.post('/watchlist', watchlistData);
  return response.data;
};

export const removeFromWatchlist = async (id) => {
  const response = await api.delete(`/watchlist/${id}`);
  return response.data;
};

// Settings
export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await api.put('/settings', settingsData);
  return response.data;
};

// System
export const resetApplication = async () => {
  const response = await api.post('/reset');
  return response.data;
};

export default api;

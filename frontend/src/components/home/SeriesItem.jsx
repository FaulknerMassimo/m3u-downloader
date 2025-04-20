// frontend/src/components/home/SeriesItem.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, Star, Film, Tv } from 'lucide-react';
import { formatEpisode } from '../../services/formatters';
import { startDownload, addToWatchlist } from '../../services/api';

const SeriesItem = ({ series, onAddToWatchlist }) => {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [error, setError] = useState(null);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleDownload = async (episode) => {
    try {
      setDownloading(true);
      setError(null);
      
      await startDownload({
        url: episode.url,
        title: `${series.title} - ${formatEpisode(episode.season, episode.episode)} - ${episode.title}`,
        m3u_link_id: series.source
      });
      
      // Show success message or notification
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to start download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      setAddingToWatchlist(true);
      setError(null);
      
      const watchlistItem = await addToWatchlist({
        title: series.title,
        series_id: series.id,
        last_episode: series.episodes && series.episodes.length > 0 
          ? JSON.stringify({
              id: series.episodes[series.episodes.length - 1].id,
              title: series.episodes[series.episodes.length - 1].title,
              season: series.episodes[series.episodes.length - 1].season,
              episode: series.episodes[series.episodes.length - 1].episode
            })
          : null
      });
      
      if (onAddToWatchlist) {
        onAddToWatchlist(watchlistItem);
      }
      
      // Show success message or notification
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      setError('Failed to add to watchlist. It might already be in your watchlist.');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleMovieDownload = async () => {
    try {
      setDownloading(true);
      setError(null);
      
      await startDownload({
        url: series.url,
        title: series.title,
        m3u_link_id: series.source
      });
      
      // Show success message or notification
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to start download. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {series.type === 'series' ? (
              <Tv size={20} className="mr-2 text-blue-500" />
            ) : (
              <Film size={20} className="mr-2 text-purple-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {series.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToWatchlist}
              disabled={addingToWatchlist}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Add to watchlist"
            >
              <Star size={18} className="text-yellow-500" />
            </button>
            
            {series.type === 'movie' ? (
              <button
                onClick={handleMovieDownload}
                disabled={downloading}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download movie"
              >
                <Download size={18} className="text-green-500" />
              </button>
            ) : (
              <button
                onClick={toggleExpanded}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={expanded ? "Hide episodes" : "Show episodes"}
              >
                {expanded ? (
                  <ChevronUp size={18} className="text-gray-500" />
                ) : (
                  <ChevronDown size={18} className="text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {expanded && series.episodes && (
          <div className="mt-4 border-t pt-4 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Episodes
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {series.episodes.map((episode) => (
                <div 
                  key={episode.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {formatEpisode(episode.season, episode.episode)} {episode.title}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(episode)}
                    disabled={downloading}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Download episode"
                  >
                    <Download size={16} className="text-green-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesItem;

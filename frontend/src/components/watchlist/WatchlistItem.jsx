// frontend/src/components/watchlist/WatchlistItem.jsx
import React, { useState } from 'react';
import { Trash2, Tv, Film } from 'lucide-react';
import { formatDate, formatEpisode } from '../../services/formatters';
import { removeFromWatchlist } from '../../services/api';

const WatchlistItem = ({ item, onRemove }) => {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setError(null);
      
      await removeFromWatchlist(item.id);
      
      if (onRemove) {
        onRemove(item.id);
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      setError('Failed to remove from watchlist');
    } finally {
      setRemoving(false);
    }
  };

  const getLastEpisodeInfo = () => {
    if (!item.last_episode) return null;
    
    try {
      const lastEpisode = JSON.parse(item.last_episode);
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last episode: {formatEpisode(lastEpisode.season, lastEpisode.episode)} {lastEpisode.title}
        </div>
      );
    } catch (error) {
      console.error('Error parsing last episode:', error);
      return null;
    }
  };

  return (
    <div className="card mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <Tv size={18} className="mr-2 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {item.title}
              </h3>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Added: {formatDate(item.added_at)}
            </div>
            
            {getLastEpisodeInfo()}
            
            {error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            disabled={removing}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Remove from watchlist"
          >
            <Trash2 size={18} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchlistItem;

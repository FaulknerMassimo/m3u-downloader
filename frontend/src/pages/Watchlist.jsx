// frontend/src/pages/Watchlist.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import WatchlistItem from '../components/watchlist/WatchlistItem';
import WatchlistSettings from '../components/watchlist/WatchlistSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchWatchlist } from '../services/api';

const Watchlist = ({ settings, setSettings }) => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchWatchlist();
        setWatchlistItems(data);
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        setError('Failed to load watchlist. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWatchlist();
  }, []);

  const handleRemoveFromWatchlist = (itemId) => {
    setWatchlistItems(watchlistItems.filter(item => item.id !== itemId));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <Header title="Watchlist" />
        <div className="py-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Header title="Watchlist" />
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header
        title="Watchlist"
        subtitle="Automatically download new episodes of your favorite series"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {watchlistItems.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400">
                  Your watchlist is empty. Add series from the home page.
                </p>
              </div>
            ) : (
              watchlistItems.map((item) => (
                <WatchlistItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFromWatchlist}
                />
              ))
            )}
          </div>
        </div>
        
        <div>
          <WatchlistSettings 
            settings={settings} 
            onUpdate={setSettings} 
          />
        </div>
      </div>
    </div>
  );
};

export default Watchlist;

// frontend/src/components/watchlist/WatchlistSettings.jsx
import React, { useState } from 'react';
import { updateSettings } from '../../services/api';

const WatchlistSettings = ({ settings, onUpdate }) => {
  const [refreshRate, setRefreshRate] = useState(settings?.watchlist_refresh_rate || 60);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(false);
      
      const updatedSettings = await updateSettings({
        ...settings,
        watchlist_refresh_rate: refreshRate
      });
      
      if (onUpdate) {
        onUpdate(updatedSettings);
      }
      
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Watchlist Settings
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="refreshRate" className="form-label">
            Refresh Rate (minutes)
          </label>
          <input
            type="number"
            id="refreshRate"
            className="form-input"
            value={refreshRate}
            onChange={(e) => setRefreshRate(parseInt(e.target.value, 10))}
            min="5"
            max="1440"
            required
          />
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            How often to check for new episodes (minimum 5 minutes)
          </p>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Settings updated successfully!
          </div>
        )}
        
        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WatchlistSettings;

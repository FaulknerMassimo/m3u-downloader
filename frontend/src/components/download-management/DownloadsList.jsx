// frontend/src/components/download-management/DownloadsList.jsx
import React from 'react';
import { cancelDownload } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DownloadsList = ({ downloads, setDownloads }) => {
  if (!downloads || downloads.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">No active downloads</p>
      </div>
    );
  }

  const handleCancelDownload = async (id) => {
    try {
      await cancelDownload(id);
      // Remove from UI immediately
      setDownloads(downloads.filter(download => download.id !== id));
    } catch (error) {
      console.error('Failed to cancel download:', error);
      alert('Failed to cancel download. Please try again.');
    }
  };

  const formatSpeed = (speed) => {
    if (!speed) return '0 KB/s';
    if (speed < 1024) return `${speed.toFixed(1)} KB/s`;
    return `${(speed / 1024).toFixed(1)} MB/s`;
  };

  const formatEta = (seconds) => {
    if (!seconds || seconds === Infinity) return 'calculating...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <div 
          key={download.id} 
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{download.title}</h3>
            <button
              onClick={() => handleCancelDownload(download.id)}
              className="px-3 py-1 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-md"
            >
              Cancel
            </button>
          </div>
          
          {download.source_name && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Source: {download.source_name}
            </p>
          )}
          
          <div className="mb-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${download.progress * 100 || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>
              {download.progress ? `${(download.progress * 100).toFixed(1)}%` : 'Starting...'}
            </div>
            <div className="flex space-x-4">
              <span>Size: {formatFileSize(download.bytesDownloaded)} / {formatFileSize(download.totalBytes || 0)}</span>
              <span>Speed: {formatSpeed(download.speed)}</span>
              <span>ETA: {formatEta(download.eta)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DownloadsList;
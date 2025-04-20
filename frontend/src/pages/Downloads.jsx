// frontend/src/pages/Downloads.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import DownloadsList from '../components/downloads/DownloadsList';
import DownloadHistory from '../components/downloads/DownloadHistory';
import { fetchActiveDownloads, fetchDownloadHistory } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Downloads = () => {
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        setIsLoading(true);
        const [active, history] = await Promise.all([
          fetchActiveDownloads(),
          fetchDownloadHistory()
        ]);
        
        setActiveDownloads(active);
        setDownloadHistory(history);
      } catch (error) {
        console.error('Failed to load downloads:', error);
        setError('Failed to load downloads. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloads();
    
    // Set up polling for active downloads
    const interval = setInterval(async () => {
      try {
        const active = await fetchActiveDownloads();
        setActiveDownloads(active);
        
        // If there are no active downloads anymore, refresh history
        if (active.length === 0 && activeDownloads.length > 0) {
          const history = await fetchDownloadHistory();
          setDownloadHistory(history);
        }
      } catch (error) {
        console.error('Failed to update active downloads:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <Header title="Downloads" />
        <div className="py-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Header title="Downloads" />
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header
        title="Downloads"
        subtitle="Manage and monitor your downloads"
      />

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Active Downloads
          </h2>
          <DownloadsList 
            downloads={activeDownloads} 
            setDownloads={setActiveDownloads}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Download History
          </h2>
          <DownloadHistory 
            downloads={downloadHistory} 
            setDownloads={setDownloadHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default Downloads;

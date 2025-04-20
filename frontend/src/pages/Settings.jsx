// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import SettingsForm from '../components/settings/SettingsForm';
import CategoryForm from '../components/settings/CategoryForm';
import M3uLinkForm from '../components/settings/M3uLinkForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchCategories, fetchM3uLinks, resetApplication } from '../services/api';
import { AlertTriangle } from 'lucide-react';

const Settings = ({ settings, setSettings }) => {
  const [categories, setCategories] = useState([]);
  const [m3uLinks, setM3uLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetStatus, setResetStatus] = useState({ loading: false, error: null, success: null });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [categoriesData, m3uLinksData] = await Promise.all([
        fetchCategories(),
        fetchM3uLinks()
      ]);
      
      setCategories(categoriesData);
      setM3uLinks(m3uLinksData);
    } catch (error) {
      console.error('Failed to load settings data:', error);
      setError('Failed to load settings data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (!window.confirm(
      'Are you sure you want to reset the application?\n\n' +
      'This will:\n' +
      '- Reset all settings to default\n' +
      '- Delete all categories and M3U links\n' +
      '- Clear download history\n' +
      '- Clear watchlist\n' +
      '- Delete log files\n' +
      '- Delete downloaded files\n\n' +
      'This action cannot be undone.'
    )) {
      return;
    }

    setResetStatus({ loading: true, error: null, success: null });
    try {
      const response = await resetApplication();
      setResetStatus({ loading: false, error: null, success: response.message });
      // Optionally, reload data or redirect after reset
      // loadData(); // Reload data to reflect changes
      // Or maybe force a page reload after a delay
      setTimeout(() => window.location.reload(), 3000); 
    } catch (err) {
      console.error('Failed to reset application:', err);
      setResetStatus({ loading: false, error: err.response?.data?.error || 'Failed to reset application.', success: null });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <Header title="Settings" />
        <div className="py-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !resetStatus.success) { // Don't show loading error if reset was successful
    return (
      <div className="container mx-auto">
        <Header title="Settings" />
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Header
        title="Settings"
        subtitle="Configure your M3U downloader"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SettingsForm 
            settings={settings} 
            onUpdate={setSettings} 
          />
          
          <CategoryForm 
            categories={categories} 
            onCategoryChange={setCategories} 
          />
        </div>
        
        <div className="space-y-6">
          <M3uLinkForm 
            m3uLinks={m3uLinks} 
            categories={categories} 
            onM3uLinksChange={setM3uLinks} 
          />

          {/* Reset Section */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center">
              <AlertTriangle size={20} className="mr-2" /> Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Resetting the application will restore all settings to their defaults, clear all data (categories, links, downloads, watchlist), and delete log and downloaded files. This action is irreversible.
            </p>
            
            {resetStatus.error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {resetStatus.error}
              </div>
            )}
            {resetStatus.success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {resetStatus.success} Reloading...
              </div>
            )}

            <button
              onClick={handleReset}
              className="btn btn-danger"
              disabled={resetStatus.loading}
            >
              {resetStatus.loading ? 'Resetting...' : 'Reset Application to Defaults'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

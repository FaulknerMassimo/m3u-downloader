// frontend/src/components/settings/SettingsForm.jsx
import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { updateSettings } from '../../services/api';

const SettingsForm = ({ settings, onUpdate }) => {
  const [downloadPath, setDownloadPath] = useState(settings?.download_path || '');
  const [webuiPort, setWebuiPort] = useState(settings?.webui_port || 3001);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      
      const updatedSettings = await updateSettings({
        ...settings,
        download_path: downloadPath.trim(),
        webui_port: parseInt(webuiPort, 10)
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        General Settings
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="downloadPath" className="form-label">
            Download Path
          </label>
          <div className="flex">
            <input
              type="text"
              id="downloadPath"
              className="form-input rounded-r-none"
              value={downloadPath}
              onChange={(e) => setDownloadPath(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              className="btn btn-secondary rounded-l-none"
              title="This would open a folder picker in a real app"
              disabled={isSubmitting}
            >
              <FolderOpen size={18} />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Where downloaded files will be saved
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="webuiPort" className="form-label">
            WebUI Port
          </label>
          <input
            type="number"
            id="webuiPort"
            className="form-input"
            value={webuiPort}
            onChange={(e) => setWebuiPort(e.target.value)}
            min="1024"
            max="65535"
            disabled={isSubmitting}
            required
          />
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Port for the web interface (requires restart)
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            Settings updated successfully!
          </div>
        )}
        
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;

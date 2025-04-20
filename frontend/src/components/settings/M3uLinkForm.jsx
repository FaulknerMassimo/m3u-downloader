// frontend/src/components/settings/M3uLinkForm.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Link } from 'lucide-react';
import { createM3uLink, updateM3uLink, deleteM3uLink } from '../../services/api';

const M3uLinkForm = ({ m3uLinks, categories, onM3uLinksChange }) => {
  const [newLink, setNewLink] = useState({ url: '', name: '', category_id: '' });
  const [editingLink, setEditingLink] = useState(null);
  const [editData, setEditData] = useState({ url: '', name: '', category_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setNewLink({ url: '', name: '', category_id: '' });
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    
    if (!newLink.url.trim() || !newLink.category_id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const link = await createM3uLink({
        url: newLink.url.trim(),
        name: newLink.name.trim() || newLink.url.trim(),
        category_id: newLink.category_id
      });
      
      if (onM3uLinksChange) {
        onM3uLinksChange([...m3uLinks, link]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to add M3U link:', error);
      setError('Failed to add M3U link. Please check the URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLink = async (e) => {
    e.preventDefault();
    
    if (!editData.url.trim() || !editData.category_id) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedLink = await updateM3uLink(editingLink.id, {
        url: editData.url.trim(),
        name: editData.name.trim() || editData.url.trim(),
        category_id: editData.category_id
      });
      
      if (onM3uLinksChange) {
        onM3uLinksChange(
          m3uLinks.map((link) => (link.id === editingLink.id ? updatedLink : link))
        );
      }
      
      setEditingLink(null);
      setEditData({ url: '', name: '', category_id: '' });
    } catch (error) {
      console.error('Failed to update M3U link:', error);
      setError('Failed to update M3U link. Please check the URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (link) => {
    if (!window.confirm(`Are you sure you want to delete "${link.name}"?`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteM3uLink(link.id);
      
      if (onM3uLinksChange) {
        onM3uLinksChange(m3uLinks.filter((l) => l.id !== link.id));
      }
    } catch (error) {
      console.error('Failed to delete M3U link:', error);
      setError('Failed to delete M3U link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (link) => {
    setEditingLink(link);
    setEditData({
      url: link.url,
      name: link.name,
      category_id: link.category_id
    });
  };

  const cancelEditing = () => {
    setEditingLink(null);
    setEditData({ url: '', name: '', category_id: '' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        M3U Links
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleAddLink} className="mb-6 space-y-4">
        <div className="form-group">
          <label htmlFor="url" className="form-label">URL</label>
          <input
            type="url"
            id="url"
            className="form-input"
            placeholder="https://example.com/playlist.m3u"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name (optional)</label>
          <input
            type="text"
            id="name"
            className="form-input"
            placeholder="My Playlist"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            id="category"
            className="form-input"
            value={newLink.category_id}
            onChange={(e) => setNewLink({ ...newLink, category_id: e.target.value })}
            disabled={isSubmitting}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !newLink.url || !newLink.category_id}
        >
          <Plus size={18} className="mr-1" /> Add M3U Link
        </button>
      </form>
      
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
          Existing Links
        </h4>
        
        {m3uLinks.length === 0 ? (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            No M3U links yet. Add one to get started.
          </div>
        ) : (
          m3uLinks.map((link) => (
            <div key={link.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              {editingLink && editingLink.id === link.id ? (
                <form onSubmit={handleEditLink} className="space-y-3">
                  <div className="form-group">
                    <label className="form-label">URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={editData.url}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={editData.category_id}
                      onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelEditing}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-white">
                        {link.name}
                      </h5>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Link size={14} className="mr-1" />
                        <span className="truncate max-w-md">{link.url}</span>
                      </div>
                      <div className="mt-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full inline-block">
                        {link.category_name}
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditing(link)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        disabled={isSubmitting}
                        title="Edit link"
                      >
                        <Edit size={16} className="text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        disabled={isSubmitting}
                        title="Delete link"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default M3uLinkForm;

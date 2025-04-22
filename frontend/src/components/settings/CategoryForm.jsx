// frontend/src/components/settings/CategoryForm.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../../services/api';

const CategoryForm = ({ categories, onCategoryChange }) => {
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryPath, setNewCategoryPath] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPath, setEditPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const category = await createCategory({ 
        name: newCategory.trim(),
        download_path: newCategoryPath.trim()
      });
      
      if (onCategoryChange) {
        onCategoryChange([...categories, category]);
      }
      
      setNewCategory('');
      setNewCategoryPath('');
    } catch (error) {
      console.error('Failed to add category:', error);
      setError('Failed to add category. It might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    if (!editName.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedCategory = await updateCategory(editingCategory.id, { 
        name: editName.trim(),
        download_path: editPath.trim()
      });
      
      if (onCategoryChange) {
        onCategoryChange(
          categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat))
        );
      }
      
      setEditingCategory(null);
      setEditName('');
      setEditPath('');
    } catch (error) {
      console.error('Failed to update category:', error);
      setError('Failed to update category. The name might already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all associated M3U links.`)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteCategory(category.id);
      
      if (onCategoryChange) {
        onCategoryChange(categories.filter((cat) => cat.id !== category.id));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError('Failed to delete category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditPath(category.download_path || '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditPath('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Categories
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleAddCategory} className="mb-4 space-y-3">
        <div className="form-group">
          <label htmlFor="newCategory" className="form-label">Name</label>
          <input
            type="text"
            id="newCategory"
            className="form-input"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newCategoryPath" className="form-label">Download Path (optional)</label>
          <div className="flex">
            <input
              type="text"
              id="newCategoryPath"
              className="form-input rounded-r-none flex-grow"
              placeholder="Leave empty to use default path"
              value={newCategoryPath}
              onChange={(e) => setNewCategoryPath(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="px-3 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-r-md flex items-center justify-center"
              title="Browse folders"
            >
              <FolderOpen size={18} className="text-gray-700" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            If left empty, a subfolder will be created in the default download path
          </p>
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <Plus size={18} className="mr-1" /> Add Category
          </button>
        </div>
      </form>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            {editingCategory && editingCategory.id === category.id ? (
              <form onSubmit={handleEditCategory} className="flex-1 space-y-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Download Path</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input rounded-r-none flex-grow"
                      value={editPath}
                      onChange={(e) => setEditPath(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="px-3 bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-r-md flex items-center justify-center"
                      title="Browse folders"
                    >
                      <FolderOpen size={18} className="text-gray-700" />
                    </button>
                  </div>
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
              <>
                <div>
                  <div className="text-gray-800 dark:text-white font-medium">{category.name}</div>
                  {category.download_path && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <FolderOpen size={14} className="mr-1" />
                        {category.download_path}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEditing(category)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                    title="Edit category"
                  >
                    <Edit size={16} className="text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                    title="Delete category"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            No categories yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryForm;

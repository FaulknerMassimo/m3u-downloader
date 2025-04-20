// frontend/src/components/settings/CategoryForm.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../../services/api';

const CategoryForm = ({ categories, onCategoryChange }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const category = await createCategory({ name: newCategory.trim() });
      
      if (onCategoryChange) {
        onCategoryChange([...categories, category]);
      }
      
      setNewCategory('');
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
      
      const updatedCategory = await updateCategory(editingCategory.id, { name: editName.trim() });
      
      if (onCategoryChange) {
        onCategoryChange(
          categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat))
        );
      }
      
      setEditingCategory(null);
      setEditName('');
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
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
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
      
      <form onSubmit={handleAddCategory} className="mb-4">
        <div className="flex">
          <input
            type="text"
            className="form-input rounded-r-none"
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <button
            type="submit"
            className="btn btn-primary rounded-l-none"
            disabled={isSubmitting}
          >
            <Plus size={18} />
          </button>
        </div>
      </form>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            {editingCategory && editingCategory.id === category.id ? (
              <form onSubmit={handleEditCategory} className="flex-1 flex">
                <input
                  type="text"
                  className="form-input rounded-r-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-l-none rounded-r-none"
                  disabled={isSubmitting}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary rounded-l-none"
                  onClick={cancelEditing}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="text-gray-800 dark:text-white">{category.name}</span>
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

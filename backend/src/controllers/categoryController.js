// backend/src/controllers/categoryController.js
const { getDb } = require('../utils/database');
const logger = require('../utils/logger');
const path = require('path');

exports.getAllCategories = async (req, res) => {
  try {
    const db = getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, download_path, use_series_folders } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const db = getDb();
    
    // If download_path is not provided, create one based on the default path
    let categoryDownloadPath = download_path;
    if (!categoryDownloadPath) {
      const settings = await db.get('SELECT download_path FROM settings WHERE id = 1');
      const basePath = settings.download_path;
      categoryDownloadPath = path.join(basePath, name);
    }
    
    // Set use_series_folders to default value of 0 if not provided
    const useSeriesFolders = use_series_folders ? 1 : 0;
    
    const result = await db.run(
      'INSERT INTO categories (name, download_path, use_series_folders) VALUES (?, ?, ?)', 
      [name, categoryDownloadPath, useSeriesFolders]
    );
    
    res.status(201).json({
      id: result.lastID,
      name,
      download_path: categoryDownloadPath,
      use_series_folders: useSeriesFolders === 1
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Category already exists' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, download_path, use_series_folders } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const db = getDb();
    
    // Get the existing category to determine what needs to be updated
    const existingCategory = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Prepare update query and parameters based on what was provided
    let updateQuery = 'UPDATE categories SET name = ?';
    let params = [name];
    
    if (download_path !== undefined) {
      updateQuery += ', download_path = ?';
      params.push(download_path);
    }
    
    if (use_series_folders !== undefined) {
      updateQuery += ', use_series_folders = ?';
      params.push(use_series_folders ? 1 : 0);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    await db.run(updateQuery, params);
    
    const updatedCategory = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    
    res.json({
      ...updatedCategory,
      use_series_folders: updatedCategory.use_series_folders === 1
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Category name already exists' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
};
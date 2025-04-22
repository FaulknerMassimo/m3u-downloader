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
    const { name, download_path } = req.body;
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
    
    const result = await db.run(
      'INSERT INTO categories (name, download_path) VALUES (?, ?)', 
      [name, categoryDownloadPath]
    );
    
    res.status(201).json({
      id: result.lastID,
      name,
      download_path: categoryDownloadPath
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
    const { name, download_path } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const db = getDb();
    
    // If download_path is provided, update it, otherwise keep existing value
    if (download_path) {
      await db.run(
        'UPDATE categories SET name = ?, download_path = ? WHERE id = ?', 
        [name, download_path, id]
      );
    } else {
      await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    }
    
    const updatedCategory = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
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
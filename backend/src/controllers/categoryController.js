// backend/src/controllers/categoryController.js
const { getDb } = require('../utils/database');
const logger = require('../utils/logger');

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
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const db = getDb();
    const result = await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
    
    res.status(201).json({
      id: result.lastID,
      name
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
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const db = getDb();
    await db.run('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    
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
// backend/src/controllers/m3uController.js
const { getDb } = require('../utils/database');
const logger = require('../utils/logger');

exports.getAllM3uLinks = async (req, res) => {
  try {
    const db = getDb();
    const links = await db.all(`
      SELECT m.*, c.name as category_name
      FROM m3u_links m
      JOIN categories c ON m.category_id = c.id
      ORDER BY c.name, m.name
    `);
    res.json(links);
  } catch (error) {
    logger.error('Error getting M3U links:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getM3uLinksByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const db = getDb();
    const links = await db.all(`
      SELECT m.*, c.name as category_name
      FROM m3u_links m
      JOIN categories c ON m.category_id = c.id
      WHERE m.category_id = ?
      ORDER BY m.name
    `, [categoryId]);
    res.json(links);
  } catch (error) {
    logger.error('Error getting M3U links by category:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createM3uLink = async (req, res) => {
  try {
    const { url, name, category_id } = req.body;
    
    if (!url || !category_id) {
      return res.status(400).json({ error: 'URL and category ID are required' });
    }
    
    const db = getDb();
    
    // Check if category exists
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const result = await db.run(
      'INSERT INTO m3u_links (url, name, category_id) VALUES (?, ?, ?)',
      [url, name || url, category_id]
    );
    
    const newLink = await db.get('SELECT * FROM m3u_links WHERE id = ?', [result.lastID]);
    
    res.status(201).json(newLink);
  } catch (error) {
    logger.error('Error creating M3U link:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateM3uLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, name, category_id } = req.body;
    
    if (!url || !category_id) {
      return res.status(400).json({ error: 'URL and category ID are required' });
    }
    
    const db = getDb();
    
    // Check if category exists
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await db.run(
      'UPDATE m3u_links SET url = ?, name = ?, category_id = ? WHERE id = ?',
      [url, name || url, category_id, id]
    );
    
    const updatedLink = await db.get('SELECT * FROM m3u_links WHERE id = ?', [id]);
    
    if (!updatedLink) {
      return res.status(404).json({ error: 'M3U link not found' });
    }
    
    res.json(updatedLink);
  } catch (error) {
    logger.error('Error updating M3U link:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteM3uLink = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const link = await db.get('SELECT * FROM m3u_links WHERE id = ?', [id]);
    
    if (!link) {
      return res.status(404).json({ error: 'M3U link not found' });
    }
    
    await db.run('DELETE FROM m3u_links WHERE id = ?', [id]);
    
    res.json({ message: 'M3U link deleted successfully' });
  } catch (error) {
    logger.error('Error deleting M3U link:', error);
    res.status(500).json({ error: error.message });
  }
};
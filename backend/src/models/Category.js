// backend/src/models/Category.js
const { getDb } = require('../utils/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.download_path = data.download_path;
    this.use_series_folders = data.use_series_folders === 1; // Convert SQLite integer to boolean
  }

  static async findAll() {
    const db = getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    return categories.map(category => new Category(category));
  }

  static async findById(id) {
    const db = getDb();
    const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    return category ? new Category(category) : null;
  }

  static async findByName(name) {
    const db = getDb();
    const category = await db.get('SELECT * FROM categories WHERE name = ?', [name]);
    return category ? new Category(category) : null;
  }

  async save() {
    const db = getDb();
    
    if (this.id) {
      // Update existing category
      await db.run(
        'UPDATE categories SET name = ?, download_path = ?, use_series_folders = ? WHERE id = ?', 
        [this.name, this.download_path, this.use_series_folders ? 1 : 0, this.id]
      );
      return this;
    } else {
      // Create new category
      const result = await db.run(
        'INSERT INTO categories (name, download_path, use_series_folders) VALUES (?, ?, ?)', 
        [this.name, this.download_path, this.use_series_folders ? 1 : 0]
      );
      this.id = result.lastID;
      return this;
    }
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete a category without an ID');
    }
    
    const db = getDb();
    await db.run('DELETE FROM categories WHERE id = ?', [this.id]);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      download_path: this.download_path,
      use_series_folders: this.use_series_folders
    };
  }
}

module.exports = Category;

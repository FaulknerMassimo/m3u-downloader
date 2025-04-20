// backend/src/models/M3uLink.js
const { getDb } = require('../utils/database');

class M3uLink {
  constructor(data) {
    this.id = data.id;
    this.category_id = data.category_id;
    this.url = data.url;
    this.name = data.name;
    this.category_name = data.category_name;
  }

  static async findAll() {
    const db = getDb();
    const links = await db.all(`
      SELECT m.*, c.name as category_name
      FROM m3u_links m
      JOIN categories c ON m.category_id = c.id
      ORDER BY c.name, m.name
    `);
    return links.map(link => new M3uLink(link));
  }

  static async findById(id) {
    const db = getDb();
    const link = await db.get(`
      SELECT m.*, c.name as category_name
      FROM m3u_links m
      JOIN categories c ON m.category_id = c.id
      WHERE m.id = ?
    `, [id]);
    return link ? new M3uLink(link) : null;
  }

  static async findByCategory(categoryId) {
    const db = getDb();
    const links = await db.all(`
      SELECT m.*, c.name as category_name
      FROM m3u_links m
      JOIN categories c ON m.category_id = c.id
      WHERE m.category_id = ?
      ORDER BY m.name
    `, [categoryId]);
    return links.map(link => new M3uLink(link));
  }

  async save() {
    const db = getDb();
    
    if (this.id) {
      // Update existing link
      await db.run(
        'UPDATE m3u_links SET url = ?, name = ?, category_id = ? WHERE id = ?',
        [this.url, this.name, this.category_id, this.id]
      );
      return this;
    } else {
      // Create new link
      const result = await db.run(
        'INSERT INTO m3u_links (url, name, category_id) VALUES (?, ?, ?)',
        [this.url, this.name, this.category_id]
      );
      this.id = result.lastID;
      return this;
    }
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete an M3U link without an ID');
    }
    
    const db = getDb();
    await db.run('DELETE FROM m3u_links WHERE id = ?', [this.id]);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      category_id: this.category_id,
      url: this.url,
      name: this.name,
      category_name: this.category_name
    };
  }
}

module.exports = M3uLink;

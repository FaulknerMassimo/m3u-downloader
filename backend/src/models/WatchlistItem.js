// backend/src/models/WatchlistItem.js
const { getDb } = require('../utils/database');

class WatchlistItem {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.series_id = data.series_id;
    this.last_episode = data.last_episode;
    this.added_at = data.added_at;
  }

  static async findAll() {
    const db = getDb();
    const items = await db.all('SELECT * FROM watchlist ORDER BY added_at DESC');
    return items.map(item => new WatchlistItem(item));
  }

  static async findById(id) {
    const db = getDb();
    const item = await db.get('SELECT * FROM watchlist WHERE id = ?', [id]);
    return item ? new WatchlistItem(item) : null;
  }

  static async findBySeriesId(seriesId) {
    const db = getDb();
    const item = await db.get('SELECT * FROM watchlist WHERE series_id = ?', [seriesId]);
    return item ? new WatchlistItem(item) : null;
  }

  async save() {
    const db = getDb();
    
    if (this.id) {
      // Update existing watchlist item
      await db.run(`
        UPDATE watchlist 
        SET title = ?, series_id = ?, last_episode = ?, added_at = ?
        WHERE id = ?
      `, [
        this.title, 
        this.series_id, 
        this.last_episode, 
        this.added_at, 
        this.id
      ]);
      return this;
    } else {
      // Create new watchlist item
      const result = await db.run(`
        INSERT INTO watchlist 
        (title, series_id, last_episode, added_at) 
        VALUES (?, ?, ?, ?)
      `, [
        this.title, 
        this.series_id, 
        this.last_episode || null, 
        this.added_at || Date.now()
      ]);
      this.id = result.lastID;
      return this;
    }
  }

  async updateLastEpisode(lastEpisode) {
    if (!this.id) {
      throw new Error('Cannot update last episode for a watchlist item without an ID');
    }
    
    this.last_episode = lastEpisode;
    
    const db = getDb();
    await db.run(
      'UPDATE watchlist SET last_episode = ? WHERE id = ?',
      [lastEpisode, this.id]
    );
    return this;
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete a watchlist item without an ID');
    }
    
    const db = getDb();
    await db.run('DELETE FROM watchlist WHERE id = ?', [this.id]);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      series_id: this.series_id,
      last_episode: this.last_episode,
      added_at: this.added_at
    };
  }
}

module.exports = WatchlistItem;

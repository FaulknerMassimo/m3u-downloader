// backend/src/models/Download.js
const { getDb } = require('../utils/database');

class Download {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.file_path = data.file_path;
    this.size = data.size;
    this.status = data.status;
    this.progress = data.progress;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.m3u_link_id = data.m3u_link_id;
    this.source_name = data.source_name;
    
    // Additional properties for active downloads
    this.speed = data.speed;
    this.eta = data.eta;
  }

  static async findAll() {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      ORDER BY d.start_time DESC
    `);
    return downloads.map(download => new Download(download));
  }

  static async findById(id) {
    const db = getDb();
    const download = await db.get(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      WHERE d.id = ?
    `, [id]);
    return download ? new Download(download) : null;
  }

  static async findActive() {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      WHERE d.status = 'downloading'
      ORDER BY d.start_time DESC
    `);
    return downloads.map(download => new Download(download));
  }

  static async findHistory() {
    const db = getDb();
    const downloads = await db.all(`
      SELECT d.*, m.name as source_name
      FROM downloads d
      LEFT JOIN m3u_links m ON d.m3u_link_id = m.id
      WHERE d.status != 'downloading'
      ORDER BY d.start_time DESC
    `);
    return downloads.map(download => new Download(download));
  }

  async save() {
    const db = getDb();
    
    if (this.id) {
      // Update existing download
      await db.run(`
        UPDATE downloads 
        SET title = ?, file_path = ?, size = ?, status = ?, progress = ?, 
            start_time = ?, end_time = ?, m3u_link_id = ?
        WHERE id = ?
      `, [
        this.title, 
        this.file_path, 
        this.size, 
        this.status, 
        this.progress, 
        this.start_time, 
        this.end_time, 
        this.m3u_link_id, 
        this.id
      ]);
      return this;
    } else {
      // Create new download
      const result = await db.run(`
        INSERT INTO downloads 
        (title, file_path, size, status, progress, start_time, end_time, m3u_link_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        this.title, 
        this.file_path, 
        this.size || null, 
        this.status, 
        this.progress || 0, 
        this.start_time, 
        this.end_time || null, 
        this.m3u_link_id || null
      ]);
      this.id = result.lastID;
      return this;
    }
  }

  async updateProgress(progress, size) {
    if (!this.id) {
      throw new Error('Cannot update progress for a download without an ID');
    }
    
    this.progress = progress;
    this.size = size;
    
    const db = getDb();
    await db.run(
      'UPDATE downloads SET progress = ?, size = ? WHERE id = ?',
      [progress, size, this.id]
    );
    return this;
  }

  async updateStatus(status, endTime = null) {
    if (!this.id) {
      throw new Error('Cannot update status for a download without an ID');
    }
    
    this.status = status;
    this.end_time = endTime || (status !== 'downloading' ? Date.now() : null);
    
    const db = getDb();
    await db.run(
      'UPDATE downloads SET status = ?, end_time = ? WHERE id = ?',
      [status, this.end_time, this.id]
    );
    return this;
  }

  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete a download without an ID');
    }
    
    const db = getDb();
    await db.run('DELETE FROM downloads WHERE id = ?', [this.id]);
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      file_path: this.file_path,
      size: this.size,
      status: this.status,
      progress: this.progress,
      start_time: this.start_time,
      end_time: this.end_time,
      m3u_link_id: this.m3u_link_id,
      source_name: this.source_name,
      speed: this.speed,
      eta: this.eta
    };
  }
}

module.exports = Download;

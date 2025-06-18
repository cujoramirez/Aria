const db = require('../database');

class Track {
    static async create(trackData) {
        const { title, artist, genre, coverImage, instrumentalFile, vocalFile, uploaderId, duration } = trackData;

        const result = await db.run(`
      INSERT INTO tracks (title, artist, genre, cover_image, instrumental_file, vocal_file, uploader_id, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, artist, genre, coverImage, instrumentalFile, vocalFile, uploaderId, duration]);

        return this.findById(result.id);
    }

    static async findById(id) {
        return await db.get(`
      SELECT t.*, u.username as uploader_username, u.display_name as uploader_name
      FROM tracks t
      LEFT JOIN users u ON t.uploader_id = u.id
      WHERE t.id = ?
    `, [id]);
    }

    static async findAll(options = {}) {
        const { search, limit = 50, offset = 0, uploaderId } = options;

        let query = `
      SELECT t.*, u.username as uploader_username, u.display_name as uploader_name
      FROM tracks t
      LEFT JOIN users u ON t.uploader_id = u.id
    `;

        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(t.title LIKE ? OR t.artist LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (uploaderId) {
            conditions.push('t.uploader_id = ?');
            params.push(uploaderId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.all(query, params);
    }

    static async update(id, updates) {
        const { title, artist } = updates;

        await db.run(`
      UPDATE tracks 
      SET title = ?, artist = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, artist, id]);

        return this.findById(id);
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM tracks WHERE id = ?', [id]);
        return result.changes > 0;
    }

    static async getByUploader(uploaderId) {
        return await db.all(`
      SELECT t.*, u.username as uploader_username, u.display_name as uploader_name
      FROM tracks t
      LEFT JOIN users u ON t.uploader_id = u.id
      WHERE t.uploader_id = ?
      ORDER BY t.created_at DESC
    `, [uploaderId]);
    }

    static async search(query) {
        if (!query || query.trim() === '') {
            return this.findAll();
        }

        return await db.all(`
      SELECT t.*, u.username as uploader_username, u.display_name as uploader_name
      FROM tracks t
      LEFT JOIN users u ON t.uploader_id = u.id
      WHERE t.title LIKE ? OR t.artist LIKE ? OR u.username LIKE ?
      ORDER BY t.created_at DESC
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    }

    static async getStats() {
        const totalTracks = await db.get('SELECT COUNT(*) as count FROM tracks');
        const totalUploaders = await db.get('SELECT COUNT(DISTINCT uploader_id) as count FROM tracks');

        return {
            totalTracks: totalTracks.count,
            totalUploaders: totalUploaders.count
        };
    }
}

module.exports = Track;
const db = require('../database');

class Playlist {
    static async create(playlistData) {
        const { name, description, coverImage, userId } = playlistData;

        const result = await db.run(`
      INSERT INTO playlists (name, description, cover_image, user_id)
      VALUES (?, ?, ?, ?)
    `, [name, description || '', coverImage || null, userId]);

        return this.findById(result.id);
    }

    static async findById(id) {
        const playlist = await db.get(`
      SELECT p.*, u.username as owner_username, u.display_name as owner_name
      FROM playlists p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

        if (playlist) {
            playlist.tracks = await this.getPlaylistTracks(id);
        }

        return playlist;
    }

    static async findByUserId(userId) {
        const playlists = await db.all(`
      SELECT p.*, u.username as owner_username, u.display_name as owner_name,
             COUNT(pt.track_id) as track_count
      FROM playlists p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [userId]);

        return playlists;
    }
    static async update(id, updates) {
        const { name, description, coverImage } = updates;

        await db.run(`
      UPDATE playlists 
      SET name = ?, description = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, description, coverImage || null, id]);

        return this.findById(id);
    }

    static async delete(id) {
        const result = await db.run('DELETE FROM playlists WHERE id = ?', [id]);
        return result.changes > 0;
    }

    static async addTrack(playlistId, trackId, position = null) {
        if (position === null) {
            // Get the next position
            const lastTrack = await db.get(`
        SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = ?
      `, [playlistId]);
            position = (lastTrack.max_pos || -1) + 1;
        }

        await db.run(`
      INSERT OR REPLACE INTO playlist_tracks (playlist_id, track_id, position)
      VALUES (?, ?, ?)
    `, [playlistId, trackId, position]);

        return true;
    }

    static async removeTrack(playlistId, trackId) {
        const result = await db.run(`
      DELETE FROM playlist_tracks 
      WHERE playlist_id = ? AND track_id = ?
    `, [playlistId, trackId]);

        // Reorder remaining tracks
        await this.reorderTracks(playlistId);

        return result.changes > 0;
    }

    static async getPlaylistTracks(playlistId) {
        return await db.all(`
      SELECT t.*, pt.position, u.username as uploader_username, u.display_name as uploader_name
      FROM playlist_tracks pt
      JOIN tracks t ON pt.track_id = t.id
      LEFT JOIN users u ON t.uploader_id = u.id
      WHERE pt.playlist_id = ?
      ORDER BY pt.position ASC
    `, [playlistId]);
    }

    static async reorderTracks(playlistId) {
        const tracks = await db.all(`
      SELECT track_id FROM playlist_tracks 
      WHERE playlist_id = ? 
      ORDER BY position ASC
    `, [playlistId]);

        for (let i = 0; i < tracks.length; i++) {
            await db.run(`
        UPDATE playlist_tracks 
        SET position = ? 
        WHERE playlist_id = ? AND track_id = ?
      `, [i, playlistId, tracks[i].track_id]);
        }
    }

    static async isTrackInPlaylist(playlistId, trackId) {
        const result = await db.get(`
      SELECT id FROM playlist_tracks 
      WHERE playlist_id = ? AND track_id = ?
    `, [playlistId, trackId]);

        return !!result;
    }

    static async getUserPlaylistCount(userId) {
        const result = await db.get(`
      SELECT COUNT(*) as count FROM playlists WHERE user_id = ?
    `, [userId]);

        return result.count;
    }
}

module.exports = Playlist;
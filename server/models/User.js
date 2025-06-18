const db = require('../database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { username, email, password, displayName } = userData;
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.run(`
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `, [username, email, passwordHash, displayName || username]);

        return this.findById(result.id);
    }

    static async findById(id) {
        return await db.get(`
      SELECT id, username, email, display_name, created_at, updated_at
      FROM users WHERE id = ?
    `, [id]);
    }

    static async findByUsername(username) {
        return await db.get(`
      SELECT id, username, email, display_name, password_hash, created_at, updated_at
      FROM users WHERE username = ?
    `, [username]);
    }

    static async findByEmail(email) {
        return await db.get(`
      SELECT id, username, email, display_name, password_hash, created_at, updated_at
      FROM users WHERE email = ?
    `, [email]);
    }

    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async updateProfile(id, updates) {
        const { displayName, email } = updates;
        await db.run(`
      UPDATE users 
      SET display_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [displayName, email, id]);

        return this.findById(id);
    }

    static async updateProfile(userId, profileData) {
        const { displayName, profileImage } = profileData;

        const updates = [];
        const params = [];

        if (displayName !== undefined) {
            updates.push('display_name = ?');
            params.push(displayName);
        }

        if (profileImage !== undefined) {
            updates.push('profile_image = ?');
            params.push(profileImage);
        }

        if (updates.length === 0) {
            return null;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);

        await db.run(`
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = ?
        `, params);

        return this.findById(userId);
    }

    static async getPreferences(userId) {
        let prefs = await db.get(`
      SELECT * FROM user_preferences WHERE user_id = ?
    `, [userId]);

        if (!prefs) {
            // Create default preferences
            await db.run(`
        INSERT INTO user_preferences (user_id, last_volume, last_instrumental_volume, last_vocal_volume)
        VALUES (?, ?, ?, ?)
      `, [userId, 0.8, 0.8, 0.8]);

            prefs = await db.get(`
        SELECT * FROM user_preferences WHERE user_id = ?
      `, [userId]);
        }

        return prefs;
    }

    static async updatePreferences(userId, preferences) {
        const { lastVolume, lastInstrumentalVolume, lastVocalVolume } = preferences;

        await db.run(`
      UPDATE user_preferences 
      SET last_volume = ?, last_instrumental_volume = ?, last_vocal_volume = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [lastVolume, lastInstrumentalVolume, lastVocalVolume, userId]);

        return this.getPreferences(userId);
    }
}

module.exports = User;
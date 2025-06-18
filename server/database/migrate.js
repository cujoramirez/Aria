const db = require('./index');

async function createTables() {
    try {
        console.log('🔨 Creating database tables...');

        // Users table
        await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        profile_image TEXT DEFAULT 'profileplaceholder.jpg',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `); // Tracks table
        await db.run(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        cover_image TEXT,
        genre TEXT,
        instrumental_file TEXT NOT NULL,
        vocal_file TEXT NOT NULL,
        duration REAL,
        is_playable BOOLEAN DEFAULT 0,
        uploader_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploader_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `); // Playlists table
        await db.run(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

        // Playlist tracks junction table
        await db.run(`
      CREATE TABLE IF NOT EXISTS playlist_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        track_id INTEGER NOT NULL,
        position INTEGER NOT NULL DEFAULT 0,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
        UNIQUE(playlist_id, track_id)
      )
    `);

        // User preferences table
        await db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        last_volume REAL DEFAULT 0.8,
        last_instrumental_volume REAL DEFAULT 0.8,
        last_vocal_volume REAL DEFAULT 0.8,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id)
      )
    `);

        // Add missing columns to existing tables if they don't exist
        try {
            await db.run(`ALTER TABLE tracks ADD COLUMN cover_image TEXT`);
        } catch (error) {
            // Column might already exist
        }

        try {
            await db.run(`ALTER TABLE tracks ADD COLUMN genre TEXT`);
        } catch (error) {
            // Column might already exist
        }

        try {
            await db.run(`ALTER TABLE playlists ADD COLUMN cover_image TEXT`);
        } catch (error) {
            // Column might already exist
        }

        try {
            await db.run(`ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT 'profileplaceholder.jpg'`);
        } catch (error) {
            // Column might already exist
        }

        // Create indexes for better performance
        await db.run('CREATE INDEX IF NOT EXISTS idx_tracks_uploader ON tracks(uploader_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track ON playlist_tracks(track_id)');

        console.log('✅ Database tables created successfully!');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    createTables().then(() => {
        process.exit(0);
    });
}

module.exports = createTables;
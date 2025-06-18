const db = require('./index');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with sample data...');

        // Create sample users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const demoUser = await db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `, ['demo', 'demo@aria.local', hashedPassword, 'Demo User']);

        const musicLover = await db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `, ['musiclover', 'music@aria.local', hashedPassword, 'Music Lover']);

        console.log('👤 Created sample users'); // Get user IDs for reference
        const users = await db.all('SELECT id, username FROM users');
        const foundDemoUser = users.find(u => u.username === 'demo');
        const foundMusicLoverUser = users.find(u => u.username === 'musiclover');
        const demoUserId = foundDemoUser ? foundDemoUser.id : null;
        const musicLoverId = foundMusicLoverUser ? foundMusicLoverUser.id : null;
        if (demoUserId) {
            // Create sample tracks with proper covers and genres
            const sampleTracks = [{
                    title: 'Believe',
                    artist: 'Cher',
                    cover: 'believe.jpg',
                    genre: 'Pop',
                    instrumental: 'believe_instrumental.mp3',
                    vocal: 'believe_vocal.mp3',
                    uploader: demoUserId,
                    duration: 239.0
                },
                {
                    title: 'Natural',
                    artist: 'Imagine Dragons',
                    cover: 'natural.jpg',
                    genre: 'Alternative Rock',
                    instrumental: 'natural_instrumental.mp3',
                    vocal: 'natural_vocal.mp3',
                    uploader: demoUserId,
                    duration: 189.0
                }, {
                    title: 'Iris',
                    artist: 'Goo Goo Dolls',
                    cover: 'iris.jpg',
                    genre: 'Alternative Rock',
                    instrumental: 'Goo Goo Dolls - Iris (Karaoke Version).mp3',
                    vocal: 'Goo goo dolls Iris (Isolated Vocals).mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 284.0,
                    isPlayable: true
                },
                {
                    title: 'Dizzy',
                    artist: 'Tommy Roe',
                    cover: 'dizzy.png',
                    genre: 'Pop',
                    instrumental: 'dizzy_instrumental.mp3',
                    vocal: 'dizzy_vocal.mp3',
                    uploader: demoUserId,
                    duration: 167.0
                },
                {
                    title: 'ILYSB',
                    artist: 'LANY',
                    cover: 'lany.jpg',
                    genre: 'Indie Pop',
                    instrumental: 'ilysb_instrumental.mp3',
                    vocal: 'ilysb_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 205.0
                },
                {
                    title: 'Sanctuary',
                    artist: 'Joji',
                    cover: 'sanctuary.jpg',
                    genre: 'R&B',
                    instrumental: 'sanctuary_instrumental.mp3',
                    vocal: 'sanctuary_vocal.mp3',
                    uploader: demoUserId,
                    duration: 180.0
                },
                {
                    title: 'Zombie',
                    artist: 'The Cranberries',
                    cover: 'zombie.jpg',
                    genre: 'Alternative Rock',
                    instrumental: 'zombie_instrumental.mp3',
                    vocal: 'zombie_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 317.0
                },
                {
                    title: 'Followed',
                    artist: 'LANY',
                    cover: 'followed.jpg',
                    genre: 'Indie Pop',
                    instrumental: 'followed_instrumental.mp3',
                    vocal: 'followed_vocal.mp3',
                    uploader: demoUserId,
                    duration: 194.0
                },
                {
                    title: 'Imaginary',
                    artist: 'Evanescence',
                    cover: 'imaginary.jpg',
                    genre: 'Gothic Rock',
                    instrumental: 'imaginary_instrumental.mp3',
                    vocal: 'imaginary_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 253.0
                },
                {
                    title: 'Never Gonna Give You Up',
                    artist: 'Rick Astley',
                    cover: 'rickroll.jpg',
                    genre: 'Pop',
                    instrumental: 'rickroll_instrumental.mp3',
                    vocal: 'rickroll_vocal.mp3',
                    uploader: demoUserId,
                    duration: 213.0
                },
                {
                    title: 'Justify My Love',
                    artist: 'Madonna',
                    cover: 'justify.jpg',
                    genre: 'Pop',
                    instrumental: 'justify_instrumental.mp3',
                    vocal: 'justify_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 299.0
                },
                {
                    title: 'Landmines',
                    artist: 'Sum 41',
                    cover: 'landmines.jpg',
                    genre: 'Punk Rock',
                    instrumental: 'landmines_instrumental.mp3',
                    vocal: 'landmines_vocal.mp3',
                    uploader: demoUserId,
                    duration: 198.0
                },
                {
                    title: 'Through the Smoke',
                    artist: 'Bryce Vine',
                    cover: 'thru-the-smoke.jpg',
                    genre: 'Hip Hop',
                    instrumental: 'smoke_instrumental.mp3',
                    vocal: 'smoke_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 176.0
                },
                {
                    title: 'Release',
                    artist: 'Pearl Jam',
                    cover: 'release.jpg',
                    genre: 'Grunge',
                    instrumental: 'release_instrumental.mp3',
                    vocal: 'release_vocal.mp3',
                    uploader: demoUserId,
                    duration: 549.0
                },
                {
                    title: 'Renaissance of Rave',
                    artist: 'Daft Punk',
                    cover: 'renaissanceofrave.jpg',
                    genre: 'Electronic',
                    instrumental: 'rave_instrumental.mp3',
                    vocal: 'rave_vocal.mp3',
                    uploader: musicLoverId || demoUserId,
                    duration: 274.0
                }
            ];
            for (const track of sampleTracks) {
                await db.run(`
          INSERT OR IGNORE INTO tracks (title, artist, cover_image, genre, instrumental_file, vocal_file, uploader_id, duration, is_playable)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [track.title, track.artist, track.cover, track.genre, track.instrumental, track.vocal, track.uploader, track.duration, track.isPlayable ? 1 : 0]);
            }

            console.log('🎵 Created sample tracks with covers and genres');

            // Create sample playlists with covers
            const playlist1 = await db.run(`
        INSERT OR IGNORE INTO playlists (name, description, cover_image, user_id)
        VALUES (?, ?, ?, ?)
      `, ['My Favorites', 'A collection of my favorite tracks', 'playlistcover1.jpg', demoUserId]);

            const playlist2 = await db.run(`
        INSERT OR IGNORE INTO playlists (name, description, cover_image, user_id)
        VALUES (?, ?, ?, ?)
      `, ['Chill Vibes', 'Relaxing music for any time', 'playlistcover2.jpg', demoUserId]);

            const playlist3 = await db.run(`
        INSERT OR IGNORE INTO playlists (name, description, cover_image, user_id)
        VALUES (?, ?, ?, ?)
      `, ['Rock Classics', 'Greatest rock anthems of all time', 'playlistcover3.jpg', musicLoverId || demoUserId]);

            console.log('📋 Created sample playlists with covers');

            // Add tracks to playlists
            const tracks = await db.all('SELECT id FROM tracks LIMIT 3');
            if (tracks.length > 0 && playlist1.id) {
                for (let i = 0; i < tracks.length; i++) {
                    await db.run(`
            INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, position)
            VALUES (?, ?, ?)
          `, [playlist1.id, tracks[i].id, i]);
                }
            }

            // Create user preferences
            await db.run(`
        INSERT OR IGNORE INTO user_preferences (user_id, last_volume, last_instrumental_volume, last_vocal_volume)
        VALUES (?, ?, ?, ?)
      `, [demoUserId, 0.8, 0.8, 0.8]);

            if (musicLoverId) {
                await db.run(`
          INSERT OR IGNORE INTO user_preferences (user_id, last_volume, last_instrumental_volume, last_vocal_volume)
          VALUES (?, ?, ?, ?)
        `, [musicLoverId, 0.7, 0.9, 0.6]);
            }

            console.log('⚙️ Created user preferences');
        }

        console.log('✅ Database seeded successfully!');
        console.log('');
        console.log('🔑 Sample login credentials:');
        console.log('   Username: demo');
        console.log('   Password: password123');
        console.log('');
        console.log('   Username: musiclover');
        console.log('   Password: password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    seedDatabase().then(() => {
        process.exit(0);
    });
}

module.exports = seedDatabase;
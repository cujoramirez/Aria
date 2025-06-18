const db = require('./database/index');

async function addUploadedTrack() {
    try {
        // Add a new track using the uploaded files
        const result = await db.run(`
            INSERT INTO tracks (
                title, artist, cover_image, genre, 
                instrumental_file, vocal_file, duration, is_playable, uploader_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Uploaded Track Demo',
            'Demo Artist',
            'placeholder.svg',
            'Demo',
            'instrumental-1750182668905-573344818.mp3',
            'vocal-1750182668965-728629340.mp3',
            240, // 4 minutes
            1, // is_playable = true
            1 // demo user id
        ]);

        console.log('✅ Added new uploaded track with ID:', result.id);

        // Verify the track was added
        const newTrack = await db.get('SELECT * FROM tracks WHERE id = ?', [result.id]);
        console.log('New track details:', newTrack);

    } catch (error) {
        console.error('Error adding uploaded track:', error);
    } finally {
        db.close();
    }
}

addUploadedTrack();
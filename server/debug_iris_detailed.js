const db = require('./database/index');

async function debugIrisTrack() {
    try {
        console.log('🔍 Debugging Iris track...');

        // Get Iris track from database
        const track = await db.get("SELECT * FROM tracks WHERE title = 'Iris'");
        console.log('📀 Iris track data:', track);

        // Check if audio files exist
        const fs = require('fs');
        const path = require('path');

        const instrumentalPath = path.join(__dirname, '../assets', track.instrumental_file);
        const vocalPath = path.join(__dirname, '../assets', track.vocal_file);

        console.log('🎵 Checking instrumental file:', instrumentalPath);
        console.log('🎤 Instrumental exists:', fs.existsSync(instrumentalPath));

        console.log('🎵 Checking vocal file:', vocalPath);
        console.log('🎤 Vocal exists:', fs.existsSync(vocalPath));

        if (fs.existsSync(instrumentalPath)) {
            const stats = fs.statSync(instrumentalPath);
            console.log('📊 Instrumental file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
        }

        if (fs.existsSync(vocalPath)) {
            const stats = fs.statSync(vocalPath);
            console.log('📊 Vocal file size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

debugIrisTrack();
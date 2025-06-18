const db = require('./database/index');

async function checkAllTracks() {
    try {
        const tracks = await db.all("SELECT * FROM tracks");
        console.log('All tracks in database:');
        tracks.forEach((track, index) => {
            console.log(`\n${index + 1}. ${track.title} by ${track.artist}`);
            console.log(`   ID: ${track.id}`);
            console.log(`   Instrumental: ${track.instrumental_file}`);
            console.log(`   Vocal: ${track.vocal_file}`);
            console.log(`   Is Playable: ${track.is_playable}`);
            console.log(`   Cover: ${track.cover_image}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

checkAllTracks();
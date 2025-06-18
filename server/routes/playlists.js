const express = require('express');
const PlaylistController = require('../controllers/playlistController');

const router = express.Router();

// Playlist routes
router.get('/', PlaylistController.getUserPlaylists);
router.post('/', PlaylistController.createPlaylist);
router.get('/:id', PlaylistController.getPlaylistById);
router.put('/:id', PlaylistController.updatePlaylist);
router.delete('/:id', PlaylistController.deletePlaylist);

// Playlist track management
router.get('/:id/tracks', PlaylistController.getPlaylistTracks);
router.post('/:id/tracks', PlaylistController.addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', PlaylistController.removeTrackFromPlaylist);

module.exports = router;
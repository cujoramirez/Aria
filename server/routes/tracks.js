const express = require('express');
const TrackController = require('../controllers/trackController');

const router = express.Router();

// Track routes
router.get('/', TrackController.getAllTracks);
router.get('/search', TrackController.searchTracks);
router.get('/my-tracks', TrackController.getUserTracks);
router.get('/:id', TrackController.getTrackById);
router.post('/', TrackController.uploadMiddleware, TrackController.uploadTrack);
router.put('/:id', TrackController.updateTrack);
router.delete('/:id', TrackController.deleteTrack);

module.exports = router;
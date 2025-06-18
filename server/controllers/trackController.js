const Track = require('../models/Track');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir;
        if (file.fieldname === 'instrumental') {
            uploadDir = 'server/uploads/instruments';
        } else if (file.fieldname === 'vocal' || file.fieldname === 'vocals') {
            uploadDir = 'server/uploads/vocals';
        } else if (file.fieldname === 'cover') {
            uploadDir = 'server/uploads/covers';
        }
        fs.ensureDirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'cover') {
            // For cover images
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for covers!'));
            }
        } else {
            // For audio files
            const allowedTypes = /mp3|wav|m4a|ogg|flac/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('audio/');

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only audio files are allowed!'));
            }
        }
    }
}).fields([
    { name: 'instrumental', maxCount: 1 },
    { name: 'vocal', maxCount: 1 },
    { name: 'vocals', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);

class TrackController {
    static uploadMiddleware = upload;

    static async getAllTracks(req, res) {
        try {
            const { search, limit, offset } = req.query;
            const options = {
                search,
                limit: limit ? parseInt(limit) : 50,
                offset: offset ? parseInt(offset) : 0
            };
            const tracks = await Track.findAll(options); // Transform database fields to camelCase for frontend
            const transformedTracks = tracks.map(track => ({
                ...track,
                coverImage: track.cover_image,
                isPlayable: track.is_playable === 1,
                instrumentalFile: track.instrumental_file,
                vocalFile: track.vocal_file,
                uploaderUsername: track.uploader_username,
                uploaderName: track.uploader_name,
                createdAt: track.created_at,
                updatedAt: track.updated_at
            }));

            res.json({
                tracks: transformedTracks,
                pagination: {
                    limit: options.limit,
                    offset: options.offset,
                    hasMore: tracks.length === options.limit
                }
            });
        } catch (error) {
            console.error('Get tracks error:', error);
            res.status(500).json({
                error: 'Failed to fetch tracks',
                message: 'Unable to retrieve track list'
            });
        }
    }

    static async getTrackById(req, res) {
        try {
            const { id } = req.params;
            const track = await Track.findById(id);

            if (!track) {
                return res.status(404).json({
                    error: 'Track not found',
                    message: 'The requested track does not exist'
                });
            }

            res.json({ track });
        } catch (error) {
            console.error('Get track error:', error);
            res.status(500).json({
                error: 'Failed to fetch track',
                message: 'Unable to retrieve track details'
            });
        }
    }
    static async uploadTrack(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to upload tracks'
                });
            }

            const { title, artist, genre, coverImage } = req.body;

            if (!title || !artist) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Title and artist are required'
                });
            } // Check for audio files (support both 'vocal' and 'vocals' fieldnames)
            const vocalFile = (req.files.vocal && req.files.vocal[0]) || (req.files.vocals && req.files.vocals[0]);
            const instrumentalFile = req.files.instrumental && req.files.instrumental[0];

            if (!instrumentalFile || !vocalFile) {
                return res.status(400).json({
                    error: 'Missing audio files',
                    message: 'Both instrumental and vocal files are required'
                });
            } // Handle cover image
            let finalCoverImage = coverImage; // Default cover from form
            if (req.files.cover && req.files.cover[0]) {
                // Custom uploaded cover
                finalCoverImage = req.files.cover[0].filename;
            }

            // For demo purposes, set a default duration
            // In a real app, you'd parse the audio file to get actual duration
            const duration = 180.0; // 3 minutes default

            const track = await Track.create({
                title,
                artist,
                genre: genre || null,
                coverImage: finalCoverImage || null,
                instrumentalFile: instrumentalFile.filename,
                vocalFile: vocalFile.filename,
                uploaderId: req.session.userId,
                duration
            });

            res.status(201).json({
                message: 'Track uploaded successfully',
                track
            });
        } catch (error) {
            console.error('Upload track error:', error);

            // Clean up uploaded files on error
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    fs.removeSync(file.path);
                });
            }

            res.status(500).json({
                error: 'Upload failed',
                message: 'Failed to upload track'
            });
        }
    }

    static async updateTrack(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to update tracks'
                });
            }

            const { id } = req.params;
            const { title, artist } = req.body;

            const existingTrack = await Track.findById(id);
            if (!existingTrack) {
                return res.status(404).json({
                    error: 'Track not found',
                    message: 'The requested track does not exist'
                });
            }

            // Check if user owns the track
            if (existingTrack.uploader_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only update your own tracks'
                });
            }

            const track = await Track.update(id, { title, artist });

            res.json({
                message: 'Track updated successfully',
                track
            });
        } catch (error) {
            console.error('Update track error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: 'Failed to update track'
            });
        }
    }

    static async deleteTrack(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to delete tracks'
                });
            }

            const { id } = req.params;

            const track = await Track.findById(id);
            if (!track) {
                return res.status(404).json({
                    error: 'Track not found',
                    message: 'The requested track does not exist'
                });
            }

            // Check if user owns the track
            if (track.uploader_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only delete your own tracks'
                });
            }

            // Delete files
            const instrumentalPath = path.join(__dirname, '../uploads/instruments', track.instrumental_file);
            const vocalPath = path.join(__dirname, '../uploads/vocals', track.vocal_file);

            fs.removeSync(instrumentalPath);
            fs.removeSync(vocalPath);

            // Delete from database
            await Track.delete(id);

            res.json({ message: 'Track deleted successfully' });
        } catch (error) {
            console.error('Delete track error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: 'Failed to delete track'
            });
        }
    }

    static async searchTracks(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim() === '') {
                return this.getAllTracks(req, res);
            }

            const tracks = await Track.search(q.trim());

            res.json({
                tracks,
                query: q,
                count: tracks.length
            });
        } catch (error) {
            console.error('Search tracks error:', error);
            res.status(500).json({
                error: 'Search failed',
                message: 'Failed to search tracks'
            });
        }
    }

    static async getUserTracks(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to view your tracks'
                });
            }

            const tracks = await Track.getByUploader(req.session.userId);

            res.json({ tracks });
        } catch (error) {
            console.error('Get user tracks error:', error);
            res.status(500).json({
                error: 'Failed to fetch tracks',
                message: 'Unable to retrieve your tracks'
            });
        }
    }
}

module.exports = TrackController;
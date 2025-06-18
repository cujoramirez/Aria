const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

class PlaylistController {
    static async getUserPlaylists(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to view playlists'
                });
            }

            const playlists = await Playlist.findByUserId(req.session.userId);

            res.json({ playlists });
        } catch (error) {
            console.error('Get playlists error:', error);
            res.status(500).json({
                error: 'Failed to fetch playlists',
                message: 'Unable to retrieve playlists'
            });
        }
    }

    static async getPlaylistById(req, res) {
        try {
            const { id } = req.params;
            const playlist = await Playlist.findById(id);

            if (!playlist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            res.json({ playlist });
        } catch (error) {
            console.error('Get playlist error:', error);
            res.status(500).json({
                error: 'Failed to fetch playlist',
                message: 'Unable to retrieve playlist details'
            });
        }
    }

    static async createPlaylist(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to create playlists'
                });
            }

            const { name, description } = req.body;

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    error: 'Missing playlist name',
                    message: 'Playlist name is required'
                });
            }
            const playlist = await Playlist.create({
                name: name.trim(),
                description: description ? description.trim() : '',
                userId: req.session.userId
            });

            res.status(201).json({
                message: 'Playlist created successfully',
                playlist
            });
        } catch (error) {
            console.error('Create playlist error:', error);
            res.status(500).json({
                error: 'Creation failed',
                message: 'Failed to create playlist'
            });
        }
    }

    static async updatePlaylist(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to update playlists'
                });
            }
            const { id } = req.params;
            const { name, description, coverImage } = req.body;

            const existingPlaylist = await Playlist.findById(id);
            if (!existingPlaylist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            // Check if user owns the playlist
            if (existingPlaylist.user_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only update your own playlists'
                });
            }

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    error: 'Missing playlist name',
                    message: 'Playlist name is required'
                });
            }

            const playlist = await Playlist.update(id, {
                name: name.trim(),
                description: description ? description.trim() : '',
                coverImage: coverImage || existingPlaylist.cover_image
            });

            res.json({
                message: 'Playlist updated successfully',
                playlist
            });
        } catch (error) {
            console.error('Update playlist error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: 'Failed to update playlist'
            });
        }
    }

    static async deletePlaylist(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to delete playlists'
                });
            }

            const { id } = req.params;

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            // Check if user owns the playlist
            if (playlist.user_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only delete your own playlists'
                });
            }

            await Playlist.delete(id);

            res.json({ message: 'Playlist deleted successfully' });
        } catch (error) {
            console.error('Delete playlist error:', error);
            res.status(500).json({
                error: 'Delete failed',
                message: 'Failed to delete playlist'
            });
        }
    }

    static async addTrackToPlaylist(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to modify playlists'
                });
            }

            const { id } = req.params;
            const { trackId } = req.body;

            if (!trackId) {
                return res.status(400).json({
                    error: 'Missing track ID',
                    message: 'Track ID is required'
                });
            }

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            // Check if user owns the playlist
            if (playlist.user_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only modify your own playlists'
                });
            }

            // Check if track exists
            const track = await Track.findById(trackId);
            if (!track) {
                return res.status(404).json({
                    error: 'Track not found',
                    message: 'The requested track does not exist'
                });
            }

            // Check if track is already in playlist
            const isInPlaylist = await Playlist.isTrackInPlaylist(id, trackId);
            if (isInPlaylist) {
                return res.status(409).json({
                    error: 'Track already in playlist',
                    message: 'This track is already in the playlist'
                });
            }

            await Playlist.addTrack(id, trackId);

            res.json({ message: 'Track added to playlist successfully' });
        } catch (error) {
            console.error('Add track to playlist error:', error);
            res.status(500).json({
                error: 'Failed to add track',
                message: 'Unable to add track to playlist'
            });
        }
    }

    static async removeTrackFromPlaylist(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to modify playlists'
                });
            }

            const { id, trackId } = req.params;

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            // Check if user owns the playlist
            if (playlist.user_id !== req.session.userId) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: 'You can only modify your own playlists'
                });
            }

            const success = await Playlist.removeTrack(id, trackId);
            if (!success) {
                return res.status(404).json({
                    error: 'Track not in playlist',
                    message: 'The track is not in this playlist'
                });
            }

            res.json({ message: 'Track removed from playlist successfully' });
        } catch (error) {
            console.error('Remove track from playlist error:', error);
            res.status(500).json({
                error: 'Failed to remove track',
                message: 'Unable to remove track from playlist'
            });
        }
    }

    static async getPlaylistTracks(req, res) {
        try {
            const { id } = req.params;

            const playlist = await Playlist.findById(id);
            if (!playlist) {
                return res.status(404).json({
                    error: 'Playlist not found',
                    message: 'The requested playlist does not exist'
                });
            }

            const tracks = await Playlist.getPlaylistTracks(id);

            res.json({ tracks });
        } catch (error) {
            console.error('Get playlist tracks error:', error);
            res.status(500).json({
                error: 'Failed to fetch tracks',
                message: 'Unable to retrieve playlist tracks'
            });
        }
    }
}

module.exports = PlaylistController;
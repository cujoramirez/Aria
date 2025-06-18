const User = require('../models/User');

class AuthController {
    static async signup(req, res) {
        try {
            const { username, email, password, displayName } = req.body;

            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Username, email, and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Invalid password',
                    message: 'Password must be at least 6 characters long'
                });
            }

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Username taken',
                    message: 'Username already exists'
                });
            }

            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(409).json({
                    error: 'Email taken',
                    message: 'Email already registered'
                });
            }

            // Create user
            const user = await User.create({
                username,
                email,
                password,
                displayName
            });

            // Create session
            req.session.userId = user.id;
            req.session.username = user.username;

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                error: 'Registration failed',
                message: 'Failed to create user account'
            });
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    error: 'Missing credentials',
                    message: 'Username and password are required'
                });
            }

            // Find user
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect'
                });
            }

            // Validate password
            const isValidPassword = await User.validatePassword(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect'
                });
            }

            // Create session
            req.session.userId = user.id;
            req.session.username = user.username;

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: 'Failed to authenticate user'
            });
        }
    }

    static async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Logout error:', err);
                    return res.status(500).json({
                        error: 'Logout failed',
                        message: 'Failed to end session'
                    });
                }

                res.clearCookie('connect.sid');
                res.json({ message: 'Logout successful' });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                message: 'Failed to logout'
            });
        }
    }

    static async getProfile(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to access your profile'
                });
            }

            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User profile not found'
                });
            }

            const preferences = await User.getPreferences(user.id);

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name,
                    createdAt: user.created_at
                },
                preferences: {
                    lastVolume: preferences.last_volume,
                    lastInstrumentalVolume: preferences.last_instrumental_volume,
                    lastVocalVolume: preferences.last_vocal_volume
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Profile fetch failed',
                message: 'Failed to get user profile'
            });
        }
    }

    static async updatePreferences(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to update preferences'
                });
            }

            const { lastVolume, lastInstrumentalVolume, lastVocalVolume } = req.body;

            const preferences = await User.updatePreferences(req.session.userId, {
                lastVolume,
                lastInstrumentalVolume,
                lastVocalVolume
            });

            res.json({
                message: 'Preferences updated successfully',
                preferences: {
                    lastVolume: preferences.last_volume,
                    lastInstrumentalVolume: preferences.last_instrumental_volume,
                    lastVocalVolume: preferences.last_vocal_volume
                }
            });
        } catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: 'Failed to update preferences'
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to update profile'
                });
            }

            const { displayName, profileImage } = req.body;

            if (!displayName && !profileImage) {
                return res.status(400).json({
                    error: 'Missing data',
                    message: 'At least one field is required to update'
                });
            }

            const user = await User.updateProfile(req.session.userId, {
                displayName,
                profileImage
            });

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User not found'
                });
            }

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name,
                    profileImage: user.profile_image,
                    createdAt: user.created_at
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                error: 'Update failed',
                message: 'Failed to update profile'
            });
        }
    }

    static async me(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to access this resource'
                });
            }

            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User account no longer exists'
                });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.display_name,
                    profilePicture: user.profile_picture
                }
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                error: 'Failed to get user data',
                message: 'Unable to retrieve user information'
            });
        }
    }
}

module.exports = AuthController;
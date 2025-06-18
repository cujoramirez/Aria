const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

// Import routes
const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/tracks');
const playlistRoutes = require('./routes/playlists');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/instruments', 'uploads/vocals'];
uploadDirs.forEach(dir => {
    fs.ensureDirSync(path.join(__dirname, dir));
});

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost with any port for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        // For production, add your actual domain here
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5000'
        ];

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'aria-music-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Static file serving with proper MIME types
const serveStatic = express.static(path.join(__dirname, '../assets'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Accept-Ranges', 'bytes');
        }
    }
});

const serveUploads = express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Accept-Ranges', 'bytes');
        }
    }
});

app.use('/assets', serveStatic);
app.use('/uploads', serveUploads);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Handle 404 for API routes specifically
app.use('/api/*', (req, res) => {
    console.log(`API 404: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Route not found',
        message: `The API endpoint ${req.url} does not exist`,
        availableRoutes: [
            'GET /api/health',
            'GET /api/auth/me',
            'POST /api/auth/login',
            'POST /api/auth/logout',
            'GET /api/tracks',
            'GET /api/playlists'
        ]
    });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🎵 Aria server running on http://localhost:${PORT}`);
    console.log(`📁 Assets served from: ${path.join(__dirname, '../assets')}`);
    console.log(`📤 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
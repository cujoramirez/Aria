# 🎵 Aria - Music Streaming Platform

**Simple setup instructions for running this project**

## 📋 What You Need
1. **Node.js** - Download from https://nodejs.org (get the LTS version)
2. That's it! Everything else is included in this zip.

## 🚀 How to Run

### Step 1: Extract the zip file
Extract this zip to any folder on your computer.

### Step 2: Open terminal/command prompt
- **Windows**: Right-click in the Aria folder → "Open in Terminal" or "Open PowerShell window here"
- **Mac/Linux**: Open terminal and navigate to the Aria folder

### Step 3: Start the server
```bash
cd server
npm start
```

### Step 4: Open your browser
Go to: **http://localhost:5000**

## ✅ That's it! 
The app should now be running. You can:
- Register a new account
- Browse and play music
- Create playlists  
- Upload your own tracks

## 🎛️ Features
- Music streaming with vocal/instrumental separation
- User accounts and playlists
- File uploads (MP3 format)
- Responsive design

## 📁 What's Included
- ✅ All source code (React frontend + Node.js backend)
- ✅ All dependencies (node_modules)
- ✅ Database with sample data
- ✅ Sample music files
- ✅ Built frontend (ready to serve)

## 🆘 Troubleshooting
- **Port 5000 in use?** The app will automatically use a different port
- **Node.js not found?** Make sure you installed Node.js from nodejs.org
- **Need help?** Check the console/terminal for error messages

---
*Everything is pre-configured and ready to run!*
- `GET /api/tracks` — List/search tracks
- `POST /api/tracks` — Upload new track (multipart/form-data)

### Playlists
- `GET /api/playlists` — List user playlists
- `POST /api/playlists` — Create playlist
- `PUT /api/playlists/:id` — Rename playlist
- `DELETE /api/playlists/:id` — Delete playlist
- `POST /api/playlists/:id/tracks` — Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` — Remove track from playlist

## Assets
All UI images are in `/assets` and used throughout the app.

## Linting & Formatting
- ESLint and Prettier are configured. Run `npx eslint .` and `npx prettier --check .`.

## Notes
- All data and uploads are local only.
- No external APIs or services are used.
- For any issues, check the server logs or browser console.

---

Happy listening!

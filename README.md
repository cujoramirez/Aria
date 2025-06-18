# Aria - Local Music Streaming App

## Overview
Aria is a local-only music streaming web application inspired by Spotify and Apple Music. It allows users to browse, play, upload, and mix vocal/instrumental stems of tracks, all running locally with no external services.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (file-based, local)
- **Frontend:** React (Create React App)
- **Authentication:** Session-based (express-session)
- **File Storage:** Local filesystem under `/uploads/instruments` and `/uploads/vocals`

## Setup Instructions

### 1. Install dependencies
```sh
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Run database migrations and seed data
```sh
cd ../server
npm run migrate
npm run seed
```

### 3. Start the app (concurrently runs backend and frontend)
```sh
cd ..
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Scripts
- `npm run dev` — Runs both client and server in development mode
- `npm run migrate` — Runs DB migrations
- `npm run seed` — Seeds the database with sample data

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout

### Tracks
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

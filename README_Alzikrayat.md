# Alzikrayat — MERN Photo Sharing Application

Alzikrayat is a full-stack photo-sharing application developed for the Advanced Web Technologies course using MongoDB, Express.js, React, and Node.js.

## Features

- Register, log in, and log out using server-side sessions
- Password hashing with bcrypt
- Home page and responsive photo gallery with grid and list views
- Upload photos with a required title and an optional description
- Open a photo detail page to view its image and metadata
- Delete photos owned by the currently logged-in user
- View and add photo comments without reloading the page
- Delete your own comments (optional enhancement)
- Rose Pink visual theme

## Technologies

- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express, express-session, Multer
- **Database:** MongoDB, Mongoose
- **Authentication:** bcrypt password hashing and session cookies

## Project structure

```text
Alzikrayat/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       └── pages/
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── uploads/            # Local uploaded images (not committed)
│   └── server.js
└── README.md
```

## Prerequisites

- Node.js and npm
- A running local MongoDB server or a MongoDB connection URI

## Setup

1. Clone the repository and open its root directory.
2. Install the backend and frontend dependencies:

```powershell
npm.cmd --prefix server install
npm.cmd --prefix client install
```

3. Create **`server/.env`** locally. Provide your own values for the following variables:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/alzikrayat
SESSION_SECRET=replace_with_a_long_random_secret
PORT=5000
```

The MongoDB URI above is only a local example. `PORT` is optional and defaults to `5000`. Do not commit `.env`, session secrets, or real credentials to GitHub.

4. Start MongoDB if you are using a local database.

## Run the application

Open two terminals in the project root directory.

**Terminal 1 — Backend**

```powershell
npm.cmd --prefix server start
```

**Terminal 2 — Frontend**

```powershell
npm.cmd --prefix client run dev
```

Open the URL printed by Vite (usually **http://localhost:5173/**). The Express backend uses **http://localhost:5000/** by default. During development, the Vite proxy forwards `/api` and `/uploads` requests to the backend.

Alternatively, when already inside `server/` or `client/`, run `npm.cmd start` or `npm.cmd run dev`, respectively.

## Basic usage

1. Create an account, or log in to an existing account.
2. Browse photos in the gallery and switch between grid and list views.
3. Upload a photo using the upload page.
4. Open a photo to see its details and comments.
5. Add comments to photos, or delete photos/comments that you own.
6. Log out when finished.

## Notes

- Photo upload accepts JPEG, PNG, and WebP file formats.
- Photos are stored locally in `server/uploads/`, with their metadata in MongoDB.
- The application uses session-based authentication; it does not require JWT.
- Never commit `.env`, `node_modules/`, or user-uploaded local images.
- The project must also be checked against the course specification for server-side validation and final submission requirements.

## Repository

https://github.com/4alromysa/Alzikrayat

# Express + React Vite Application

A full-stack application with Express backend and React Vite frontend that run concurrently.

## Setup

1. Install server dependencies:
   ```
   npm install
   ```

2. Install client dependencies:
   ```
   npm run install-client
   ```

## Running the Application

To run both the server and client concurrently:
```
npm run dev
```

This will start:
- Express server on http://localhost:5000
- React Vite frontend on http://localhost:5173

## Available Scripts

- `npm run dev` - Run both server and client in development mode
- `npm run server` - Run only the Express server with nodemon
- `npm run client` - Run only the React Vite client
- `npm start` - Run the Express server in production mode
- `npm run build` - Build the React client for production
- `npm run install-client` - Install client dependencies

## Project Structure

- `/server` - Express server code
  - `/server/routes` - API routes
  - `/server/server.js` - Main server file
- `/client` - React Vite frontend
  - Standard Vite + React structure 
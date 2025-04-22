# API URL Configuration

This document explains how to configure the API URL for different environments in your application.

## How It Works

The application uses environment variables to determine where the backend API is located:

1. In development, it reads from the `.env` file in the root directory
2. The value is passed to the client via `client/.env` file with the `VITE_` prefix
3. The client reads this value with `import.meta.env.VITE_API_URL`

## Setting the API URL

### Development

For local development, you can:

1. Edit the `.env` file directly:
   ```
   API_URL=http://localhost:8080/api
   NODE_ENV=development
   ```

2. Or simply use the start script which will automatically detect the correct port:
   ```
   ./start-dev.sh
   ```

### Production

For production deployments, you have several options:

1. Use the predefined scripts:
   ```
   # For Heroku
   npm run prepare-heroku
   
   # For other environments (edit package.json first to set the URL)
   npm run prepare-other
   ```

2. Set it manually:
   ```
   npm run set-api-url https://your-custom-api-url.com/api
   ```

3. Edit the `.env` file directly before building the application:
   ```
   API_URL=https://your-api-url.com/api
   NODE_ENV=production
   ```

## Checking Current Configuration

To check which API URL is currently configured:

1. Look at the `.env` file in the root directory
2. During application startup, the URL will be logged to the console
3. You can also check the network requests in your browser's developer tools 
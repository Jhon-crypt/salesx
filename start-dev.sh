#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "🌿 Loaded environment variables from .env"
else
  echo "⚠️ No .env file found. Using default settings."
fi

# Kill any existing node processes
echo "📋 Cleaning up any existing Node.js processes..."
killall node 2>/dev/null || true
pkill -f "node.*server/server.js" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

# Clean up temporary files
rm -f .port.tmp

# Start the server
echo "🚀 Starting the server..."
npm run server &

# Wait for the server to start and identify the port
echo "⏳ Waiting for server to start..."
SERVER_PORT=8080  # Default port
count=0
max_attempts=15

while [ ! -f .port.tmp ] && [ $count -lt $max_attempts ]; do
  sleep 1
  count=$((count + 1))
  echo "Waiting for server to write port number... ($count/$max_attempts)"
done

if [ -f .port.tmp ]; then
  SERVER_PORT=$(cat .port.tmp)
  echo "✅ Server started on port $SERVER_PORT"
else
  echo "⚠️ Server port file not found. Using default port 8080."
fi

# Update API_URL in .env if it's not already set or if we found a different port
if [ -z "$API_URL" ] || [[ "$API_URL" != *":$SERVER_PORT/"* ]]; then
  API_URL="http://localhost:$SERVER_PORT/api"
  echo "API_URL=$API_URL" > .env.tmp
  grep -v '^API_URL=' .env >> .env.tmp
  mv .env.tmp .env
  echo "✅ Updated API_URL in .env to $API_URL"
fi

# Update the client env file
echo "VITE_API_URL=$API_URL" > client/.env
echo "✅ Updated client/.env with API_URL: $API_URL"

# Start the client
echo "🚀 Starting the client..."
npm run client

# Cleanup on exit
trap 'echo "Stopping all processes..."; killall node 2>/dev/null || true' EXIT 
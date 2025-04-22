const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Import routes
const apiRoutes = require('./routes/api');
const dbRoutes = require('./routes/db');

// Load environment variables
dotenv.config();

const app = express();
const PREFERRED_PORT = process.env.PORT || 8080;
const ALTERNATIVE_PORTS = [3000, 4000, 9000]; // Try these ports if preferred port is in use

// Function to start server on the first available port
function startServer(ports, index = 0) {
  if (index >= ports.length) {
    console.error('❌ All ports are in use. Unable to start server.');
    process.exit(1);
    return;
  }
  
  const PORT = ports[index];
  const server = http.createServer(app);
  
  server.listen(PORT, (err) => {
    if (err) {
      console.log(`Port ${PORT} is in use, trying next port...`);
      startServer(ports, index + 1);
      return;
    }
    
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`API available at http://localhost:${PORT}/api/test`);
    console.log(`Database test endpoint available at http://localhost:${PORT}/api/db/test`);
    
    // Write the selected port to .env file for client to use
    const fs = require('fs');
    fs.writeFileSync('./.port.tmp', PORT.toString());
    console.log(`Port ${PORT} saved to .port.tmp file`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use, trying next port...`);
      startServer(ports, index + 1);
      return;
    }
    console.error('Server error:', err);
    process.exit(1);
  });
}

// Simplified CORS configuration - allow all origins for development
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is up and running');
});

// API Routes
app.use('/api', apiRoutes);
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API is working!' });
});

// Database Routes
app.use('/api/db', dbRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server with port fallback
startServer([PREFERRED_PORT, ...ALTERNATIVE_PORTS]); 
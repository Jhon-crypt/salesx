/**
 * Database connection check
 * This script checks if the database connection is working
 * It is used during Heroku startup to report any database connection issues
 */

const sql = require('mssql');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get connection string from environment
const connectionString = process.env.DB_CONNECTION_STRING;

// Check if connection string is provided
if (!connectionString) {
  console.error('⚠️ WARNING: Database connection string not found in environment.');
  console.log('The application will start, but database features will not work.');
  process.exit(0); // Exit gracefully to allow app to start without DB
}

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  
  try {
    await sql.connect(connectionString);
    console.log('✅ Database connection successful!');
    process.exit(0); // Success exit code
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('The application will start, but database features may not work correctly.');
    process.exit(0); // Exit with 0 to allow Heroku to continue startup
  }
}

// Run the check
checkDatabaseConnection().catch(err => {
  console.error('Unexpected error during database check:', err);
  process.exit(0); // Exit gracefully
}); 
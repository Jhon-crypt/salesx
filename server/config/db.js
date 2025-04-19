const sql = require('mssql');

const config = {
  server: '162.144.216.212',
  database: 'KFC_INSIGHT_REPLICA',
  user: 'kfc_readonly_user',
  password: 'D7MFZt4OL[4~',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Use this for self-signed certs
    connectionTimeout: 60000,
    requestTimeout: 60000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 60000
    }
  }
};

// Create connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Handle pool errors
pool.on('error', err => {
  console.error('SQL Server connection error:', err);
});

module.exports = {
  sql,
  pool,
  poolConnect
}; 
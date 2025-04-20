const express = require('express');
const router = express.Router();
const { pool, sql } = require('../config/db');

// Test database connection
router.get('/test', async (req, res) => {
  try {
    await pool.connect();
    res.json({ success: true, message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to database',
      error: err.message
    });
  }
});

// Get a sample of data
router.get('/sample', async (req, res) => {
  try {
    await pool.connect();
    
    // Simple query to get some data
    const result = await pool.request()
      .query('SELECT TOP 10 * FROM INFORMATION_SCHEMA.TABLES');
    
    res.json({ 
      success: true, 
      message: 'Query executed successfully',
      data: result.recordset
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error executing query',
      error: err.message
    });
  }
});

// Get database tables
router.get('/tables', async (req, res) => {
  try {
    await pool.connect();
    
    const result = await pool.request()
      .query(`
        SELECT 
          t.TABLE_SCHEMA as schema_name,
          t.TABLE_NAME as table_name,
          t.TABLE_TYPE as table_type
        FROM 
          INFORMATION_SCHEMA.TABLES t
        ORDER BY 
          t.TABLE_SCHEMA, t.TABLE_NAME
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      tables: result.recordset
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving tables',
      error: err.message
    });
  }
});

// Get column info for a specific table
router.get('/columns/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    await pool.connect();
    
    const result = await pool.request()
      .input('tableName', sql.VarChar, tableName)
      .query(`
        SELECT 
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          CHARACTER_MAXIMUM_LENGTH as max_length,
          IS_NULLABLE as is_nullable
        FROM 
          INFORMATION_SCHEMA.COLUMNS
        WHERE 
          TABLE_NAME = @tableName
        ORDER BY 
          ORDINAL_POSITION
      `);
    
    res.json({ 
      success: true, 
      table: tableName,
      count: result.recordset.length,
      columns: result.recordset
    });
  } catch (err) {
    console.error('Column info query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving column information',
      error: err.message
    });
  }
});

// Get sample data from a specific table
router.get('/sample-data/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    await pool.connect();
    
    const result = await pool.request()
      .input('tableName', sql.VarChar, tableName)
      .query(`
        SELECT TOP 10 * 
        FROM [dbo].[${tableName}]
      `);
    
    res.json({ 
      success: true, 
      table: tableName,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Sample data query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving sample data',
      error: err.message
    });
  }
});

// Simple sales totals endpoint without any joins
router.get('/simple-sales', async (req, res) => {
  try {
    await pool.connect();
    
    const result = await pool.request()
      .query(`
        SELECT TOP 20
          FKStoreId as store_id,
          DateOfBusiness as business_date,
          GrossSales as gross_sales,
          NetSales as net_sales,
          NumberOfChecks as check_count,
          NumberOfGuests as guest_count
        FROM
          dbo.DpvHstSalesTotals
        WHERE
          DateOfBusiness >= DATEADD(day, -30, GETDATE())
        ORDER BY
          DateOfBusiness DESC
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Simple sales query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving simple sales data',
      error: err.message
    });
  }
});

// Get store sales data using actual KFC schema
router.get('/store-sales', async (req, res) => {
  try {
    await pool.connect();
    
    // Using the gblStore and DpvHstSalesTotals views based on discovered schema
    const result = await pool.request()
      .query(`
        SELECT TOP 50
          s.StoreId as store_id,
          s.Name as store_name,
          st.DateOfBusiness as transaction_date,
          st.NetSales as daily_sales,
          st.GrossSales as gross_sales,
          st.NumberOfChecks as check_count,
          st.NumberOfGuests as guest_count
        FROM
          dbo.DpvHstSalesTotals st
        JOIN
          dbo.gblStore s ON st.FKStoreId = s.StoreId
        WHERE
          st.DateOfBusiness >= DATEADD(day, -30, GETDATE())
        ORDER BY
          st.DateOfBusiness DESC, st.NetSales DESC
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('KFC store sales query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving store sales data',
      error: err.message
    });
  }
});

// Get item sales data
router.get('/item-sales', async (req, res) => {
  try {
    await pool.connect();
    
    const result = await pool.request()
      .query(`
        SELECT TOP 50
          i.LongName as item_name,
          i.ItemId as item_number,
          sales.DateOfBusiness as sale_date,
          sales.FKStoreId as store_id,
          s.Name as store_name,
          COUNT(*) as quantity_sold,
          SUM(sales.Price) as sales_amount
        FROM
          dbo.DpvHstGndItem sales
        JOIN
          dbo.Item i ON sales.FKItemId = i.ItemId
        JOIN
          dbo.gblStore s ON sales.FKStoreId = s.StoreId
        WHERE
          sales.DateOfBusiness >= DATEADD(day, -30, GETDATE())
        GROUP BY
          i.LongName, i.ItemId, sales.DateOfBusiness, sales.FKStoreId, s.Name
        ORDER BY
          quantity_sold DESC, sales_amount DESC
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Item sales query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving item sales data',
      error: err.message
    });
  }
});

// Get transaction details based on GndItem data dictionary
router.get('/transaction-items', async (req, res) => {
  try {
    await pool.connect();
    
    // Simplified query that doesn't join with other tables to avoid timeout
    const result = await pool.request()
      .query(`
        SELECT TOP 50
          FKItemId as item_id,
          CheckNumber as check_number,
          DateOfBusiness as business_date,
          Price as price,
          Quantity as quantity,
          Type as record_type,
          FKCategoryId as category_id,
          FKOrderModeId as order_mode_id,
          FKStoreId as store_id,
          FKEmployeeNumber as employee_id
        FROM
          dbo.DpvHstGndItem
        WHERE
          DateOfBusiness >= DATEADD(day, -10, GETDATE())
        ORDER BY
          DateOfBusiness DESC, CheckNumber DESC
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Transaction items query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving transaction items data',
      error: err.message
    });
  }
});

// Get void transactions based on GndVoid data dictionary
router.get('/void-transactions', async (req, res) => {
  try {
    await pool.connect();
    
    // Simplified query that doesn't join with other tables to avoid timeout
    const result = await pool.request()
      .query(`
        SELECT TOP 50
          CheckNumber as check_id,
          FKItemId as item_id,
          Price as price,
          DateOfBusiness as business_date,
          Hour as transaction_hour,
          Minute as transaction_minute,
          FKReasonId as void_reason_id,
          FKEmployeeNumber as employee_id,
          FKManagerNumber as manager_id,
          FKStoreId as store_id
        FROM
          dbo.DpvHstGndVoid
        WHERE
          DateOfBusiness >= DATEADD(day, -30, GETDATE())
        ORDER BY
          DateOfBusiness DESC, Hour DESC, Minute DESC
      `);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Void transactions query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving void transactions data',
      error: err.message
    });
  }
});

module.exports = router; 
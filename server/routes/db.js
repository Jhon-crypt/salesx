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
    const { date } = req.query;
    await pool.connect();
    
    let query = `
      SELECT TOP 20
        FKStoreId as store_id,
        DateOfBusiness as business_date,
        GrossSales as gross_sales,
        NetSales as net_sales,
        NumberOfChecks as check_count,
        NumberOfGuests as guest_count
      FROM
        dbo.DpvHstSalesTotals
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (date) {
      // If specific date is requested
      query += ` AND CONVERT(DATE, DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 30 days if no date specified
      query += ` AND DateOfBusiness >= DATEADD(day, -30, GETDATE())`;
    }
    
    query += ` ORDER BY DateOfBusiness DESC`;
    
    const result = await request.query(query);
    
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
    const { date, start_date, end_date, store_id } = req.query;
    await pool.connect();
    
    let query = `
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
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // If both start and end dates are provided (date range)
      query += ` AND CONVERT(DATE, st.DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, st.DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date) {
      // If specific date is requested
      query += ` AND CONVERT(DATE, st.DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 30 days if no date specified
      query += ` AND st.DateOfBusiness >= DATEADD(day, -30, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND st.FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += ` ORDER BY st.DateOfBusiness DESC`;
    
    const result = await request.query(query);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Store sales query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving store sales data',
      error: err.message
    });
  }
});

// Get item sales for menu analysis
router.get('/item-sales', async (req, res) => {
  try {
    const { date, start_date, end_date, store_id } = req.query;
    console.log('Item sales request params:', { date, start_date, end_date, store_id });
    
    await pool.connect();
    
    let query = `
      SELECT TOP 50
        i.LongName as item_name,
        i.ItemId as item_number,
        sales.DateOfBusiness as sale_date,
        sales.FKStoreId as store_id,
        s.Name as store_name,
        COUNT(*) as quantity_sold,
        SUM(sales.Price) as sales_amount
      FROM
        dbo.DpvHstGndItem sales WITH (NOLOCK)
      JOIN
        dbo.Item i WITH (NOLOCK) ON sales.FKItemId = i.ItemId
      JOIN
        dbo.gblStore s WITH (NOLOCK) ON sales.FKStoreId = s.StoreId
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // If both start and end dates are provided
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date) {
      // If specific date is requested
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 7 days if no date specified
      query += ` AND sales.DateOfBusiness >= DATEADD(day, -7, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND sales.FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += `
      GROUP BY
        i.LongName, i.ItemId, sales.DateOfBusiness, sales.FKStoreId, s.Name
      ORDER BY
        quantity_sold DESC, sales_amount DESC
    `;
    
    console.log('Item sales query:', query);
    
    const result = await request.query(query);
    
    console.log('Item sales result count:', result.recordset.length);
    
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

// Get menu items sold by hour
router.get('/item-sales-by-hour', async (req, res) => {
  try {
    const { start_date, end_date, store_id, item_id } = req.query;
    await pool.connect();
    
    let query = `
      SELECT
        i.LongName as item_name,
        i.ItemId as item_number,
        sales.Hour as hour,
        sales.FKStoreId as store_id,
        s.Name as store_name,
        COUNT(*) as quantity_sold,
        SUM(sales.Price) as sales_amount,
        sales.DateOfBusiness as business_date
      FROM
        dbo.DpvHstGndItem sales WITH (NOLOCK)
      JOIN
        dbo.Item i WITH (NOLOCK) ON sales.FKItemId = i.ItemId
      JOIN
        dbo.gblStore s WITH (NOLOCK) ON sales.FKStoreId = s.StoreId
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date range
    if (start_date && end_date) {
      // If both start and end dates are provided
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (start_date) {
      // If only start date is provided, use it as a single day filter
      query += ` AND CONVERT(DATE, sales.DateOfBusiness) = @start_date`;
      request.input('start_date', sql.Date, new Date(start_date));
    } else {
      // Default to yesterday if no dates specified
      query += ` AND sales.DateOfBusiness >= DATEADD(day, -1, GETDATE())`;
      query += ` AND sales.DateOfBusiness < GETDATE()`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND sales.FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    if (item_id) {
      // Filter by specific menu item if provided
      query += ` AND sales.FKItemId = @item_id`;
      request.input('item_id', sql.Int, parseInt(item_id, 10));
    }
    
    query += `
      GROUP BY
        i.LongName, i.ItemId, sales.Hour, sales.FKStoreId, s.Name, sales.DateOfBusiness
      ORDER BY
        sales.DateOfBusiness, sales.Hour ASC, quantity_sold DESC
    `;
    
    const result = await request.query(query);
    
    res.json({ 
      success: true, 
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (err) {
    console.error('Item sales by hour query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving item sales by hour data',
      error: err.message
    });
  }
});

// Get transaction details - optimized for performance
router.get('/transaction-items', async (req, res) => {
  try {
    const { date, start_date, end_date, store_id } = req.query;
    console.log('Transaction items request params:', { date, start_date, end_date, store_id });
    
    await pool.connect();
    
    let query = `
      SELECT TOP 100
        i.FKItemId as item_id,
        i.CheckNumber as check_number,
        i.DateOfBusiness as business_date,
        i.Price as price,
        i.Quantity as quantity,
        i.Type as record_type,
        i.FKCategoryId as category_id,
        i.FKStoreId as store_id,
        s.Name as store_name
      FROM
        dbo.DpvHstGndItem i WITH (NOLOCK)
      JOIN
        dbo.gblStore s WITH (NOLOCK) ON i.FKStoreId = s.StoreId
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // If both start and end dates are provided
      query += ` AND CONVERT(DATE, i.DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, i.DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date && date.trim() !== '') {
      // If specific date is requested
      query += ` AND CONVERT(DATE, i.DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 30 days if no date specified (increased from 3 days)
      query += ` AND i.DateOfBusiness >= DATEADD(day, -30, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND i.FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += `
      ORDER BY
        i.DateOfBusiness DESC, i.CheckNumber DESC
    `;
    
    console.log('Transaction items query:', query);
    
    const result = await request.query(query);
    
    console.log('Transaction items result count:', result.recordset.length);
    
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
    const { date, start_date, end_date, store_id } = req.query;
    await pool.connect();
    
    let query = `
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
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (start_date && end_date) {
      // If date range is specified
      query += ` AND DateOfBusiness BETWEEN @start_date AND @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date) {
      // If specific date is requested
      query += ` AND CONVERT(DATE, DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 30 days if no date specified
      query += ` AND DateOfBusiness >= DATEADD(day, -30, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += `
      ORDER BY
        DateOfBusiness DESC, Hour DESC, Minute DESC
    `;
    
    const result = await request.query(query);
    
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

// Get a summary of sales, active orders, and customer metrics
router.get('/sales-summary', async (req, res) => {
  try {
    const { date, start_date, end_date, store_id } = req.query;
    
    // Use static cache to avoid recalculating within short time periods
    const CACHE_KEY = `sales_summary_cache_${start_date || date || 'default'}_${end_date || 'none'}_store_${store_id || 'all'}`;
    const CACHE_TTL = 60000; // 1 minute cache
    
    if (global[CACHE_KEY] && global[CACHE_KEY].timestamp > Date.now() - CACHE_TTL) {
      return res.json(global[CACHE_KEY].data);
    }
    
    await pool.connect();
    
    let targetDate, previousDate;
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // Use the start date as target date for calculations
      targetDate = new Date(start_date);
      // Previous date is one day before the target date
      previousDate = new Date(targetDate);
      previousDate.setDate(previousDate.getDate() - 1);
    } else if (date) {
      // Use the requested date
      targetDate = new Date(date);
      // Previous date is one day before the target date
      previousDate = new Date(targetDate);
      previousDate.setDate(previousDate.getDate() - 1);
    } else {
      // Default to today
      targetDate = new Date();
      // Previous date is yesterday
      previousDate = new Date(Date.now() - 86400000);
    }
    
    // Format dates for SQL
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const previousDateStr = previousDate.toISOString().split('T')[0]; // Previous day
    
    // Build the query
    const request = pool.request()
      .input('targetDate', sql.Date, targetDateStr)
      .input('previousDate', sql.Date, previousDateStr);
      
    // Add store filter if provided
    let storeFilter = '';
    if (store_id) {
      storeFilter = 'AND FKStoreId = @store_id';
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    const query = `
      SELECT
        (SELECT ISNULL(NetSales, 0) FROM (SELECT TOP 1 NetSales FROM dbo.DpvHstSalesTotals WITH (NOLOCK) 
         WHERE DateOfBusiness = @targetDate ${storeFilter}) AS t) AS targetSales,
        
        (SELECT ISNULL(NetSales, 0) FROM (SELECT TOP 1 NetSales FROM dbo.DpvHstSalesTotals WITH (NOLOCK) 
         WHERE DateOfBusiness = @previousDate ${storeFilter}) AS y) AS previousSales,
        
        (SELECT ISNULL(NumberOfChecks, 0) FROM (SELECT TOP 1 NumberOfChecks FROM dbo.DpvHstSalesTotals WITH (NOLOCK) 
         WHERE DateOfBusiness = @targetDate ${storeFilter}) AS t) AS targetCheckCount,
        
        (SELECT ISNULL(NumberOfChecks, 0) FROM (SELECT TOP 1 NumberOfChecks FROM dbo.DpvHstSalesTotals WITH (NOLOCK) 
         WHERE DateOfBusiness = @previousDate ${storeFilter}) AS y) AS previousCheckCount,
        
        (SELECT COUNT(DISTINCT CheckNumber) FROM (SELECT TOP 1000 CheckNumber FROM dbo.DpvHstGndItem WITH (NOLOCK) 
         WHERE DateOfBusiness = @targetDate ${storeFilter}) AS a) AS activeOrders,
        
        (SELECT COUNT(DISTINCT CheckNumber) FROM (SELECT TOP 1000 CheckNumber FROM dbo.DpvHstGndItem WITH (NOLOCK) 
         WHERE DateOfBusiness = @previousDate ${storeFilter}) AS p) AS previousDayOrders
    `;
    
    const result = await request.query(query);

    // Extract the data
    const {
      targetSales,
      previousSales,
      targetCheckCount,
      previousCheckCount,
      activeOrders,
      previousDayOrders
    } = result.recordset[0];

    // Calculate metrics
    const targetCustomers = Math.round(targetCheckCount * 1.5);
    const previousCustomers = Math.round(previousCheckCount * 1.5);
    
    // Calculate trend percentages with safety checks
    const salesTrend = (previousSales > 0 && targetSales > 0)
      ? Math.min(Math.max(((targetSales - previousSales) / previousSales) * 100, -99), 999) // Limit extreme values
      : 0;
    
    const ordersTrend = (previousDayOrders > 0 && activeOrders > 0)
      ? Math.min(Math.max(((activeOrders - previousDayOrders) / previousDayOrders) * 100, -99), 999)
      : 0;
    
    const customersTrend = (previousCustomers > 0 && targetCustomers > 0)
      ? Math.min(Math.max(((targetCustomers - previousCustomers) / previousCustomers) * 100, -99), 999)
      : 0;

    const response = {
      success: true,
      data: {
        todaySales: targetSales || 0,
        salesTrend: parseFloat(salesTrend.toFixed(1)),
        activeOrders: activeOrders || 0,
        ordersTrend: parseFloat(ordersTrend.toFixed(1)),
        customers: targetCustomers || 0,
        customersTrend: parseFloat(customersTrend.toFixed(1)),
      }
    };
    
    // Store in cache
    global[CACHE_KEY] = {
      timestamp: Date.now(),
      data: response
    };
    
    res.json(response);
  } catch (err) {
    console.error('Sales summary query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving sales summary data',
      error: err.message
    });
  }
});

// Get menu items statistics
router.get('/menu-stats', async (req, res) => {
  try {
    const { date, start_date, end_date, store_id } = req.query;
    console.log('Menu stats request params:', { date, start_date, end_date, store_id });
    
    await pool.connect();
    
    // Query to get basic menu item stats
    let query = `
      SELECT 
        (SELECT COUNT(*) FROM dbo.Item WITH (NOLOCK)) as total_items,
        COUNT(DISTINCT FKItemId) as active_items,
        MAX(item_count) as max_item_quantity,
        SUM(total_revenue) as total_revenue
      FROM (
        SELECT 
          FKItemId,
          COUNT(*) as item_count,
          SUM(Price) as total_revenue
        FROM 
          dbo.DpvHstGndItem WITH (NOLOCK)
        WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // If both start and end dates are provided
      query += ` AND CONVERT(DATE, DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date && date.trim() !== '') {
      // If specific date is requested
      query += ` AND CONVERT(DATE, DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 7 days if no date specified
      query += ` AND DateOfBusiness >= DATEADD(day, -7, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += `
        GROUP BY FKItemId
      ) as sales_data
    `;
    
    console.log('Menu stats query:', query);
    
    const result = await request.query(query);
    
    // Get active items count from the item-sales endpoint as fallback
    let menuItemCount = result.recordset[0]?.total_items || 0;
    
    // Fallback: if total_items is zero, check active_items
    if (menuItemCount === 0) {
      menuItemCount = result.recordset[0]?.active_items || 0;
    }
    
    // Second fallback: if still zero, use hard-coded minimum count
    if (menuItemCount === 0) {
      menuItemCount = 100; // A reasonable fallback value for menu items
    }
    
    console.log('Menu stats result:', { 
      total: menuItemCount,
      active: result.recordset[0]?.active_items
    });
    
    // Ensure we return a valid count even if no data is found
    const menuStats = {
      menuItemCount: menuItemCount
    };
    
    res.json({ 
      success: true, 
      data: menuStats
    });
  } catch (err) {
    console.error('Menu statistics query error:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu statistics',
      error: err.message
    });
  }
});

// Get sales by category for revenue breakdown
router.get('/category-sales', async (req, res) => {
  try {
    const { date, start_date, end_date, store_id } = req.query;
    await pool.connect();
    
    let query = `
      SELECT TOP 10
        c.Name as category_name,
        SUM(i.Price * i.Quantity) as sales_amount
      FROM 
        dbo.DpvHstGndItem i WITH (NOLOCK)
      JOIN
        dbo.Category c WITH (NOLOCK) ON i.FKCategoryId = c.CategoryId
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    // Handle date filtering with priority to date range
    if (start_date && end_date) {
      // If both start and end dates are provided
      query += ` AND CONVERT(DATE, i.DateOfBusiness) >= @start_date`;
      query += ` AND CONVERT(DATE, i.DateOfBusiness) <= @end_date`;
      request.input('start_date', sql.Date, new Date(start_date));
      request.input('end_date', sql.Date, new Date(end_date));
    } else if (date) {
      // If specific date is requested
      query += ` AND CONVERT(DATE, i.DateOfBusiness) = @date`;
      request.input('date', sql.Date, new Date(date));
    } else {
      // Default to last 7 days if no date specified
      query += ` AND i.DateOfBusiness >= DATEADD(day, -7, GETDATE())`;
    }
    
    if (store_id) {
      // Filter by store if provided
      query += ` AND i.FKStoreId = @store_id`;
      request.input('store_id', sql.Int, parseInt(store_id, 10));
    }
    
    query += `
      GROUP BY
        c.Name
      ORDER BY
        sales_amount DESC
    `;
    
    const categorySalesResult = await request.query(query);

    // Get total sales for percentage calculation
    const totalSales = categorySalesResult.recordset.reduce(
      (sum, item) => sum + item.sales_amount, 0
    );

    // Generate default colors for categories
    const colors = [
      '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#ff9800', 
      '#f44336', '#9c27b0', '#673ab7', '#009688', '#ffc107'
    ];

    // Format the response with percentages and colors
    const formattedData = categorySalesResult.recordset.map((item, index) => {
      return {
        name: item.category_name,
        value: parseFloat(item.sales_amount.toFixed(2)),
        color: colors[index % colors.length],
        percentage: parseFloat(((item.sales_amount / totalSales) * 100).toFixed(0))
      };
    });

    res.json({
      success: true,
      data: formattedData
    });
  } catch (err) {
    console.error('Category sales query error:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving category sales data',
      error: err.message
    });
  }
});

module.exports = router; 
import axios from 'axios';

// Determine the appropriate base URL based on environment
const getBaseUrl = () => {
  // Check for API_URL in environment variables
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Check multiple conditions to determine if we're in production
  const isProd = import.meta.env.PROD || 
                 window.location.hostname.includes('herokuapp.com') ||
                 window.location.hostname !== 'localhost';
  
  console.log('Environment:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('Hostname:', window.location.hostname);
  
  // Ports to try in order (will try each until one works)
  const developmentPorts = [8080, 3000, 4000, 9000];
  
  // Use relative URL in production, localhost in development
  if (isProd) {
    return '/api';
  } else {
    // In development, try to connect to the server on different ports
    // The server will try these ports in sequence if any are in use
    return `http://localhost:${developmentPorts[0]}/api`;
  }
};

// Log the chosen baseURL for debugging
const baseURL = getBaseUrl();
console.log('API baseURL:', baseURL);

// Base API configuration
const api = axios.create({
  baseURL,
  timeout: 60000, // 60 seconds timeout for slow queries
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor to detect server port issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a network error and we're in development, try other ports
    if (error.message === 'Network Error' && 
        !import.meta.env.PROD && 
        window.location.hostname === 'localhost') {
      console.warn('Network error occurred. Server might be running on a different port.');
    }
    return Promise.reject(error);
  }
);

// Types based on our database schema
export interface SalesData {
  store_id: number;
  store_name?: string;
  transaction_date: string;
  daily_sales: number;
  gross_sales: number;
  check_count: number;
  guest_count: number;
}

export interface ItemSalesData {
  item_name: string;
  item_number: number;
  sale_date: string;
  store_id: number;
  store_name: string;
  quantity_sold: number;
  sales_amount: number;
}

export interface ItemSalesByHour {
  item_name: string;
  item_number: number;
  hour: number;
  store_id: number;
  store_name: string;
  quantity_sold: number;
  sales_amount: number;
  business_date: string;
}

export interface TransactionItem {
  item_id: number;
  check_number: number;
  business_date: string;
  price: number;
  quantity: number;
  record_type: string;
  category_id: number;
  order_mode_id: number;
  store_id: number;
  employee_id: number;
  store_name?: string;
  // Keep these for backward compatibility
  id?: number;
  transaction_date?: string;
  menu_item_name?: string;
  item_sell_price?: number;
  void_flag?: number;
}

export interface VoidTransaction {
  check_id: number;
  item_id: number;
  price: number;
  business_date: string;
  transaction_hour: number;
  transaction_minute: number;
  void_reason_id: number;
  employee_id: number;
  manager_id: number;
  store_id: number;
}

// Add new interfaces for dashboard data
export interface SalesSummary {
  todaySales: number;
  salesTrend: number;
  activeOrders: number;
  ordersTrend: number;
  customers: number;
  customersTrend: number;
}

export interface MenuStats {
  menuItemCount: number;
}

export interface CategorySales {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface StoreInfo {
  store_id: number;
  store_name: string;
  transaction_date?: string;
  daily_sales?: number;
  gross_sales?: number;
  check_count?: number;
  guest_count?: number;
}

// API functions for database endpoints
export const dbApi = {
  // Test connection
  testConnection: async () => {
    const response = await api.get('/db/test');
    return response.data;
  },
  
  // Get simple sales data without joins
  getSimpleSales: async (date?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (date) params.date = date;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: SalesData[]}>('/db/simple-sales', { params });
    return response.data.data;
  },

  // Get store sales with store information
  getStoreSales: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: SalesData[]}>('/db/store-sales', { params });
    return response.data.data;
  },

  // Get unique store information from store sales data
  getStores: async () => {
    const response = await api.get<{success: boolean, data: SalesData[]}>('/db/store-sales');
    // Extract unique stores from the data
    const salesData = response.data.data;
    const storeMap = new Map<number, StoreInfo>();
    
    // Process each record and keep the most recent data for each store
    salesData.forEach(record => {
      if (!storeMap.has(record.store_id)) {
        storeMap.set(record.store_id, {
          store_id: record.store_id,
          store_name: record.store_name || `Store ${record.store_id}`,
          transaction_date: record.transaction_date,
          daily_sales: record.daily_sales,
          gross_sales: record.gross_sales,
          check_count: record.check_count,
          guest_count: record.guest_count
        });
      }
    });
    
    // Convert map values to array
    return Array.from(storeMap.values());
  },

  // Get item sales data
  getItemSales: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: ItemSalesData[]}>('/db/item-sales', { params });
    return response.data.data;
  },

  // Get menu items sold by hour
  getItemSalesByHour: async (startDate?: string, endDate?: string, store_id?: number | null, item_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    if (item_id !== null && item_id !== undefined) params.item_id = item_id;
    
    const response = await api.get<{success: boolean, data: ItemSalesByHour[]}>('/db/item-sales-by-hour', { params });
    return response.data.data;
  },

  // Get transaction items
  getTransactionItems: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: TransactionItem[]}>('/db/transaction-items', { params });
    return response.data.data;
  },

  // Get void transactions
  getVoidTransactions: async (date?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (date) params.date = date;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: VoidTransaction[]}>('/db/void-transactions', { params });
    return response.data.data;
  },

  // Get database tables
  getTables: async () => {
    const response = await api.get('/db/tables');
    return response.data.tables;
  },

  // Get columns for a specific table
  getTableColumns: async (tableName: string) => {
    const response = await api.get(`/db/columns/${tableName}`);
    return response.data.columns;
  },

  // Get sample data from a table
  getTableSampleData: async (tableName: string) => {
    const response = await api.get(`/db/sample-data/${tableName}`);
    return response.data.data;
  },

  // Get current sales summary for dashboard
  getSalesSummary: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: SalesSummary}>('/db/sales-summary', { params });
    return response.data.data;
  },
  
  // Get menu items statistics
  getMenuStats: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: MenuStats}>('/db/menu-stats', { params });
    return response.data.data;
  },
  
  // Get sales by category for revenue breakdown
  getCategorySales: async (startDate?: string, endDate?: string, store_id?: number | null) => {
    const params: Record<string, string | number> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (store_id !== null && store_id !== undefined) params.store_id = store_id;
    
    const response = await api.get<{success: boolean, data: CategorySales[]}>('/db/category-sales', { params });
    return response.data.data;
  },
};

export default api; 
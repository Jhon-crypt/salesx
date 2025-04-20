import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 60000, // 60 seconds timeout for slow queries
  headers: {
    'Content-Type': 'application/json',
  }
});

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

// API functions for database endpoints
export const dbApi = {
  // Test connection
  testConnection: async () => {
    const response = await api.get('/db/test');
    return response.data;
  },
  
  // Get simple sales data without joins
  getSimpleSales: async () => {
    const response = await api.get<{success: boolean, data: SalesData[]}>('/db/simple-sales');
    return response.data.data;
  },

  // Get store sales with store information
  getStoreSales: async () => {
    const response = await api.get<{success: boolean, data: SalesData[]}>('/db/store-sales');
    return response.data.data;
  },

  // Get item sales data
  getItemSales: async () => {
    const response = await api.get<{success: boolean, data: ItemSalesData[]}>('/db/item-sales');
    return response.data.data;
  },

  // Get transaction items
  getTransactionItems: async () => {
    const response = await api.get<{success: boolean, data: TransactionItem[]}>('/db/transaction-items');
    return response.data.data;
  },

  // Get void transactions
  getVoidTransactions: async () => {
    const response = await api.get<{success: boolean, data: VoidTransaction[]}>('/db/void-transactions');
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
  }
};

export default api; 
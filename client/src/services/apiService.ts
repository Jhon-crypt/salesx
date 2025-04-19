import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // Extended timeout to match server-side configuration
  headers: {
    'Content-Type': 'application/json',
  }
});

// Type definitions for API responses
export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  error?: string;
}

// Store Sales data types
export interface StoreSalesData {
  store_id: number;
  store_name: string;
  transaction_date: string;
  daily_sales: number;
  gross_sales: number;
  check_count: number;
  guest_count: number;
}

// Simple Sales data types
export interface SimpleSalesData {
  store_id: number;
  business_date: string;
  gross_sales: number;
  net_sales: number;
  check_count: number;
  guest_count: number;
}

// Item Sales data types
export interface ItemSalesData {
  item_name: string;
  item_number: number;
  sale_date: string;
  store_id: number;
  store_name: string;
  quantity_sold: number;
  sales_amount: number;
}

// Transaction data types
export interface TransactionItemData {
  item_id: number;
  check_number: number;
  business_date: string;
  price: number;
  quantity: number;
  record_type: number;
  category_id: number;
  order_mode_id: number;
  store_id: number;
  employee_id: number;
}

// Void transaction data types
export interface VoidTransactionData {
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

// API Service methods
const apiService = {
  // Test DB connection
  testConnection: async (): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse<any>>('/db/test');
      return response.data.success;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  // Get store sales data with store details
  getStoreSales: async (): Promise<StoreSalesData[]> => {
    try {
      const response = await api.get<ApiResponse<StoreSalesData[]>>('/db/store-sales');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch store sales data:', error);
      return [];
    }
  },

  // Get simple sales data without joins
  getSimpleSales: async (): Promise<SimpleSalesData[]> => {
    try {
      const response = await api.get<ApiResponse<SimpleSalesData[]>>('/db/simple-sales');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch simple sales data:', error);
      return [];
    }
  },

  // Get item sales data
  getItemSales: async (): Promise<ItemSalesData[]> => {
    try {
      const response = await api.get<ApiResponse<ItemSalesData[]>>('/db/item-sales');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch item sales data:', error);
      return [];
    }
  },

  // Get transaction item details
  getTransactionItems: async (): Promise<TransactionItemData[]> => {
    try {
      const response = await api.get<ApiResponse<TransactionItemData[]>>('/db/transaction-items');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transaction items:', error);
      return [];
    }
  },

  // Get void transaction data
  getVoidTransactions: async (): Promise<VoidTransactionData[]> => {
    try {
      const response = await api.get<ApiResponse<VoidTransactionData[]>>('/db/void-transactions');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch void transactions:', error);
      return [];
    }
  },
};

export default apiService; 
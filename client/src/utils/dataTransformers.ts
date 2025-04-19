import { format, parseISO, subDays } from 'date-fns';
import { 
  StoreSalesData, 
  SimpleSalesData, 
  ItemSalesData, 
  TransactionItemData,
  VoidTransactionData
} from '../services/apiService';

// Types for chart data
export interface SalesChartData {
  name: string;
  sales: number;
  orders: number;
  customers: number;
}

export interface RevenueBreakdownData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface PopularItemData {
  id: string;
  name: string;
  category: string;
  popularity: number;
  sales: number;
  price: number;
}

export interface StatsCardData {
  todaySales: number;
  todayOrders: number;
  todayCustomers: number;
  menuItems: number;
  salesTrend: number;
  ordersTrend: number;
  customersTrend: number;
}

export interface RecentOrderData {
  id: string;
  customer: {
    name: string;
    initial: string;
    avatar?: string;
  };
  items: number;
  total: number;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  date: string;
  tableNumber?: number;
}

// Color palette for charts
export const chartColors = [
  '#3f51b5', // Primary
  '#2196f3', // Secondary
  '#00bcd4', // Info
  '#4caf50', // Success
  '#ff9800', // Warning
  '#f44336', // Error
  '#9c27b0', // Purple
  '#009688', // Teal
  '#607d8b'  // Grey
];

// Convert sales data to chart format
export const transformSalesDataForChart = (salesData: StoreSalesData[], timeRange: 'day' | 'week' | 'month' | 'year'): SalesChartData[] => {
  if (!salesData || salesData.length === 0) {
    return [];
  }

  // Sort by date ascending
  const sortedData = [...salesData].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  // Group by date and aggregate
  const dateMap = new Map<string, { sales: number, orders: number, customers: number }>();
  
  sortedData.forEach(item => {
    const date = format(parseISO(item.transaction_date), getDateFormat(timeRange));
    
    if (!dateMap.has(date)) {
      dateMap.set(date, { sales: 0, orders: 0, customers: 0 });
    }
    
    const current = dateMap.get(date)!;
    dateMap.set(date, {
      sales: current.sales + item.daily_sales,
      orders: current.orders + item.check_count,
      customers: current.customers + item.guest_count
    });
  });

  // Convert map to array and format
  return Array.from(dateMap.entries()).map(([date, values]) => ({
    name: date,
    sales: Math.round(values.sales * 100) / 100, // Round to 2 decimal places
    orders: values.orders,
    customers: values.customers
  }));
};

// Helper to get date format based on time range
const getDateFormat = (timeRange: 'day' | 'week' | 'month' | 'year'): string => {
  switch (timeRange) {
    case 'day': return 'HH:00';
    case 'week': return 'EEE';
    case 'month': return 'd';
    case 'year': return 'MMM';
    default: return 'yyyy-MM-dd';
  }
};

// Transform item sales data for popular items
export const transformPopularItems = (itemSales: ItemSalesData[]): PopularItemData[] => {
  if (!itemSales || itemSales.length === 0) {
    return [];
  }

  // Group by item and calculate totals
  const itemMap = new Map<number, { 
    name: string, 
    sales: number, 
    quantity: number,
    price: number 
  }>();

  itemSales.forEach(item => {
    if (!itemMap.has(item.item_number)) {
      itemMap.set(item.item_number, {
        name: item.item_name,
        sales: 0,
        quantity: 0,
        price: item.sales_amount / item.quantity_sold // Estimate price per unit
      });
    }

    const current = itemMap.get(item.item_number)!;
    itemMap.set(item.item_number, {
      ...current,
      sales: current.sales + item.sales_amount,
      quantity: current.quantity + item.quantity_sold
    });
  });

  // Sort by sales amount descending and take top items
  const sortedItems = Array.from(itemMap.entries())
    .sort((a, b) => b[1].sales - a[1].sales)
    .slice(0, 10);
  
  // Calculate popularity score (0-100) based on position in the list
  return sortedItems.map(([id, item], index) => ({
    id: id.toString(),
    name: item.name,
    category: getCategoryFromName(item.name), // Helper function to guess category
    popularity: Math.round(100 - (index * (100 / sortedItems.length))), // Higher for top items
    sales: Math.round(item.quantity),
    price: Math.round(item.price * 100) / 100
  }));
};

// Helper to guess category from item name
const getCategoryFromName = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('combo')) return 'Combo';
  if (lowerName.includes('chicken')) return 'Chicken';
  if (lowerName.includes('sandwich')) return 'Sandwich';
  if (lowerName.includes('salad')) return 'Salad';
  if (lowerName.includes('drink') || lowerName.includes('soda') || lowerName.includes('pepsi')) return 'Beverage';
  if (lowerName.includes('fries') || lowerName.includes('side')) return 'Side';
  if (lowerName.includes('dessert') || lowerName.includes('cake')) return 'Dessert';
  
  return 'Main Course';
};

// Transform sales data into revenue breakdown
export const transformRevenueBreakdown = (itemSales: ItemSalesData[]): RevenueBreakdownData[] => {
  if (!itemSales || itemSales.length === 0) {
    return [];
  }

  // Group by category (guessed from item names)
  const categoryMap = new Map<string, number>();
  
  itemSales.forEach(item => {
    const category = getCategoryFromName(item.item_name);
    categoryMap.set(category, (categoryMap.get(category) || 0) + item.sales_amount);
  });

  // Calculate total sales
  const totalSales = Array.from(categoryMap.values()).reduce((sum, sales) => sum + sales, 0);
  
  // Convert to revenue breakdown format
  return Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by sales descending
    .slice(0, 5) // Take top 5 categories
    .map(([category, sales], index) => ({
      name: category,
      value: Math.round(sales * 100) / 100,
      color: chartColors[index % chartColors.length],
      percentage: Math.round((sales / totalSales) * 100)
    }));
};

// Generate stats card data
export const generateStatsCardData = (salesData: StoreSalesData[]): StatsCardData => {
  if (!salesData || salesData.length === 0) {
    return {
      todaySales: 0,
      todayOrders: 0,
      todayCustomers: 0,
      menuItems: 84, // Default
      salesTrend: 0,
      ordersTrend: 0,
      customersTrend: 0
    };
  }

  // Get today's date and yesterday's date
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Filter for today's and yesterday's data
  const todayData = salesData.filter(item => 
    format(parseISO(item.transaction_date), 'yyyy-MM-dd') === today
  );
  
  const yesterdayData = salesData.filter(item => 
    format(parseISO(item.transaction_date), 'yyyy-MM-dd') === yesterday
  );

  // Calculate totals for today
  const todaySales = todayData.reduce((sum, item) => sum + item.daily_sales, 0);
  const todayOrders = todayData.reduce((sum, item) => sum + item.check_count, 0);
  const todayCustomers = todayData.reduce((sum, item) => sum + item.guest_count, 0);

  // Calculate totals for yesterday
  const yesterdaySales = yesterdayData.reduce((sum, item) => sum + item.daily_sales, 0);
  const yesterdayOrders = yesterdayData.reduce((sum, item) => sum + item.check_count, 0);
  const yesterdayCustomers = yesterdayData.reduce((sum, item) => sum + item.guest_count, 0);

  // Calculate trends
  const salesTrend = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
  const ordersTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;
  const customersTrend = yesterdayCustomers > 0 ? ((todayCustomers - yesterdayCustomers) / yesterdayCustomers) * 100 : 0;

  return {
    todaySales,
    todayOrders,
    todayCustomers,
    menuItems: 84, // Default value or calculate from unique items
    salesTrend,
    ordersTrend,
    customersTrend
  };
};

// Transform transaction data into recent orders
export const transformRecentOrders = (transactions: TransactionItemData[]): RecentOrderData[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Group by check number
  const checkMap = new Map<number, {
    date: string;
    items: number;
    total: number;
    employee_id: number;
    store_id: number;
  }>();

  transactions.forEach(tx => {
    if (!checkMap.has(tx.check_number)) {
      checkMap.set(tx.check_number, {
        date: tx.business_date,
        items: 0,
        total: 0,
        employee_id: tx.employee_id,
        store_id: tx.store_id
      });
    }

    const current = checkMap.get(tx.check_number)!;
    checkMap.set(tx.check_number, {
      ...current,
      items: current.items + tx.quantity,
      total: current.total + (tx.price * tx.quantity)
    });
  });

  // Convert to RecentOrderData format with random status
  return Array.from(checkMap.entries())
    .sort((a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime()) // Sort by date descending
    .slice(0, 5) // Take most recent 5
    .map(([checkNumber, data]) => {
      // Create friendly relative time string
      const orderDate = new Date(data.date);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
      
      let friendlyDate;
      if (diffMinutes < 60) {
        friendlyDate = `${diffMinutes} min ago`;
      } else if (diffMinutes < 1440) {
        friendlyDate = `${Math.floor(diffMinutes / 60)} hours ago`;
      } else {
        friendlyDate = format(orderDate, 'MMM d');
      }

      // Generate a random status (in a real app this would come from data)
      const statuses: ('completed' | 'in_progress' | 'pending' | 'cancelled')[] = ['completed', 'in_progress', 'pending', 'cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate customer name from employee ID as a placeholder
      const customerName = `Customer ${data.employee_id}`;
      
      return {
        id: checkNumber.toString(),
        customer: {
          name: customerName,
          initial: customerName.split(' ').map(part => part[0]).join('')
        },
        items: Math.round(data.items),
        total: Math.round(data.total * 100) / 100,
        status: randomStatus,
        date: friendlyDate,
        tableNumber: Math.floor(Math.random() * 20) + 1 // Random table number
      };
    });
};

export default {
  transformSalesDataForChart,
  transformPopularItems,
  transformRevenueBreakdown,
  generateStatsCardData,
  transformRecentOrders
}; 
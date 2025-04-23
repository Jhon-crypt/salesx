import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme, Paper, Stack, TextField } from '@mui/material';
import { format } from 'date-fns';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import RevenueBreakdown from '../components/dashboard/RevenueBreakdown';
import RecentOrders from '../components/dashboard/RecentOrders';
import PopularItems from '../components/dashboard/PopularItems';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useStoreContext } from '../contexts/StoreContext';

// API hooks
import useApi from '../hooks/useApi';
import { dbApi, SalesSummary, MenuStats, CategorySales, TransactionItem, ItemSalesData, SalesData } from '../services/api';

// Global data context to share data between components
const DashboardDataContext = React.createContext<{
  salesSummary: SalesSummary | null;
  menuStats: MenuStats | null;
  categorySales: CategorySales[] | null;
  transactionItems: TransactionItem[] | null;
  itemSales: ItemSalesData[] | null;
  storeSales: SalesData[] | null;
  fetchDashboardData?: (date: string) => void;
}>({
  salesSummary: null,
  menuStats: null,
  categorySales: null,
  transactionItems: null,
  itemSales: null,
  storeSales: null,
});

// Enhanced components that use data from context rather than fetching themselves
const DashboardSalesChart: React.FC<{ title: string; subtitle?: string }> = (props) => {
  const { storeSales } = React.useContext(DashboardDataContext);
  const { selectedStoreId } = useStoreContext();
  
  // Filter sales data by selected store if needed
  const filteredSales = useMemo(() => {
    if (!storeSales) return undefined;
    if (selectedStoreId === null) return storeSales;
    return storeSales.filter(sale => sale.store_id === selectedStoreId);
  }, [storeSales, selectedStoreId]);
  
  return <SalesChart {...props} preloadedData={filteredSales || undefined} />;
};

const DashboardRevenueBreakdown: React.FC<{ title: string; subtitle?: string }> = (props) => {
  const { categorySales } = React.useContext(DashboardDataContext);
  return <RevenueBreakdown {...props} preloadedData={categorySales || undefined} />;
};

const DashboardRecentOrders: React.FC<{ title: string; subtitle?: string; onViewAll?: () => void }> = (props) => {
  const { transactionItems } = React.useContext(DashboardDataContext);
  const { selectedStoreId } = useStoreContext();
  
  // Filter transaction items by selected store if needed
  const filteredItems = useMemo(() => {
    if (!transactionItems) return undefined;
    if (selectedStoreId === null) return transactionItems;
    return transactionItems.filter(item => item.store_id === selectedStoreId);
  }, [transactionItems, selectedStoreId]);
  
  return <RecentOrders {...props} preloadedData={filteredItems || undefined} />;
};

const DashboardPopularItems: React.FC<{ title: string; subtitle?: string; onViewAll?: () => void }> = (props) => {
  const { itemSales } = React.useContext(DashboardDataContext);
  const { selectedStoreId } = useStoreContext();
  
  // Filter item sales by selected store if needed
  const filteredItems = useMemo(() => {
    if (!itemSales) return undefined;
    if (selectedStoreId === null) return itemSales;
    return itemSales.filter(item => item.store_id === selectedStoreId);
  }, [itemSales, selectedStoreId]);
  
  return <PopularItems {...props} preloadedData={filteredItems || undefined} />;
};

const DashboardContent: React.FC = () => {
  // Yesterday's date calculation
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);

  // State for date picker
  const [selectedDate, setSelectedDate] = useState<string>(format(yesterday, 'yyyy-MM-dd'));

  // Get global store context
  const { selectedStore } = useStoreContext();

  // Get dashboard data from context
  const { 
    salesSummary,
    menuStats,
    fetchDashboardData
  } = useContext(DashboardDataContext);

  // Fetch data when selected date changes
  useEffect(() => {
    console.log('Current selectedDate:', selectedDate);
    if (fetchDashboardData) {
      fetchDashboardData(selectedDate);
    }
  }, [selectedDate, fetchDashboardData]);
  
  const theme = useTheme();
  
  // Format the date for display
  const formattedDate = format(yesterday, 'EEEE, MMMM d, yyyy');
  
  // Log for debugging
  useEffect(() => {
    console.log('Dashboard rendering with date:', selectedDate);
  }, [selectedDate]);
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}11 0%, ${theme.palette.secondary.main}11 100%)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                SalesX Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                All your restaurant metrics in one place
                {selectedStore && (
                  <> for <b>{selectedStore.store_name}</b></>
                )}
              </Typography>
            </Box>
            
            {salesSummary?.salesTrend != null && (
              <Box sx={{ 
                py: 0.5, 
                px: 2, 
                borderRadius: 2, 
                backgroundColor: salesSummary.salesTrend >= 0 ? '#10b98120' : '#f4433620', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <ArrowUpwardIcon 
                  sx={{ 
                    color: salesSummary.salesTrend >= 0 ? theme.palette.success.main : theme.palette.error.main, 
                    fontSize: 16, 
                    mr: 1,
                    transform: salesSummary.salesTrend < 0 ? 'rotate(180deg)' : 'none'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  color={salesSummary.salesTrend >= 0 ? theme.palette.success.main : theme.palette.error.main}
                  fontWeight="medium"
                >
                  Sales {salesSummary.salesTrend >= 0 ? 'Up' : 'Down'} {Math.abs(salesSummary.salesTrend)}% from last week
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                color="inherit"
                href="/"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Dashboard
              </Typography>
            </Breadcrumbs>
            
            <TextField
              label="Select Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ width: 200 }}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {formattedDate}
          </Typography>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Sales"
            value={salesSummary?.todaySales || 0}
            prefix="$"
            trend={salesSummary?.salesTrend}
            trendLabel="vs Previous Day"
            icon={<ReceiptIcon />}
            color="primary"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Active Orders"
            value={salesSummary?.activeOrders || 0}
            trend={salesSummary?.ordersTrend}
            trendLabel="vs Last Hour"
            icon={<ShoppingCartIcon />}
            color="secondary"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Customers"
            value={salesSummary?.customers || 0}
            trend={salesSummary?.customersTrend}
            trendLabel="vs Yesterday"
            icon={<GroupIcon />}
            color="success"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Menu Items"
            value={menuStats?.menuItemCount || 0}
            suffix="items"
            icon={<StoreIcon />}
            color="warning"
          />
        </Box>
      </Box>

      {/* Sales Chart */}
      <Box sx={{ mb: 3 }}>
        <DashboardSalesChart
          title="Sales Overview"
          subtitle="Track your restaurant's sales performance over time"
        />
      </Box>

      {/* Revenue Breakdown */}
      <Box sx={{ mb: 3 }}>
        <DashboardRevenueBreakdown
          title="Revenue Breakdown"
          subtitle="Sales distribution by food category"
        />
      </Box>

      {/* Orders and Popular Items */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', lg: '58.33%' }}}>
          <DashboardRecentOrders
            title="Recent Orders"
            subtitle="Latest orders from your customers"
            onViewAll={() => console.log('View all orders')}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', lg: '41.67%' }}}>
          <DashboardPopularItems
            title="Popular Items"
            subtitle="Best-selling items in your menu"
            onViewAll={() => console.log('View all menu items')}
          />
        </Box>
      </Box>
    </Box>
  );
};

const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Yesterday's date calculation
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);

  // State for date picker - using the date directly in the API calls
  const selectedDate = format(yesterday, 'yyyy-MM-dd');
  
  // Get store selection from the global context
  const { selectedStoreId } = useStoreContext();
  
  // Fetch all dashboard data in parallel at component mount
  const { data: salesSummaryData } = useApi(
    () => dbApi.getSalesSummary(selectedDate),
    { deps: [selectedDate] }
  );
  
  const { data: menuStatsData } = useApi(
    () => dbApi.getMenuStats(selectedDate),
    { deps: [selectedDate] }
  );
  
  const { data: categorySalesData } = useApi(
    () => dbApi.getCategorySales(selectedDate),
    { deps: [selectedDate] }
  );
  
  const { data: transactionItemsData } = useApi(
    () => dbApi.getTransactionItems(selectedDate),
    { deps: [selectedDate] }
  );
  
  const { data: itemSalesData } = useApi(
    () => dbApi.getItemSales(selectedDate),
    { deps: [selectedDate] }
  );
  
  const { data: storeSalesData } = useApi(
    () => dbApi.getStoreSales(selectedDate),
    { deps: [selectedDate] }
  );
  
  // Function to fetch dashboard data
  const fetchDashboardData = useCallback((date: string) => {
    console.log('Fetching dashboard data for date:', date);
    // Data is already fetched via useApi hooks with date as dependency
  }, []);
  
  // Calculate filtered sales summary based on selected store
  const filteredSalesSummary = useMemo(() => {
    if (!salesSummaryData) return null;
    if (selectedStoreId === null) return salesSummaryData;
    
    // If we have a store selected and store sales data, calculate store-specific summary
    if (storeSalesData) {
      const storeData = storeSalesData.find(s => s.store_id === selectedStoreId);
      if (storeData) {
        // Return store-specific data with some calculated metrics
        return {
          ...salesSummaryData,
          todaySales: storeData.daily_sales || 0,
          // Keep other metrics as is or calculate if you have store-specific data
        };
      }
    }
    return salesSummaryData;
  }, [salesSummaryData, selectedStoreId, storeSalesData]);
  
  // Combined data object for context
  const dashboardData = {
    salesSummary: filteredSalesSummary,
    menuStats: menuStatsData || null,
    categorySales: categorySalesData || null,
    transactionItems: transactionItemsData || null,
    itemSales: itemSalesData || null,
    storeSales: storeSalesData || null,
    fetchDashboardData
  };
  
  return (
    <DashboardDataContext.Provider value={dashboardData}>
      {children}
    </DashboardDataContext.Provider>
  );
};

const Dashboard: React.FC = () => {
  return (
    <DashboardDataProvider>
      <DashboardContent />
    </DashboardDataProvider>
  );
};

export default Dashboard; 
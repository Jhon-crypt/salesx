import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme, Paper, Stack, TextField, Divider, CircularProgress, Backdrop, IconButton } from '@mui/material';
import { format } from 'date-fns';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import RevenueBreakdown from '../components/dashboard/RevenueBreakdown';
import RecentOrders from '../components/dashboard/RecentOrders';
import PopularItems from '../components/dashboard/PopularItems';
import StoreSelector from '../components/common/StoreSelector';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';

// API hooks
import useApi from '../hooks/useApi';
import { dbApi, SalesSummary, MenuStats, CategorySales, TransactionItem, ItemSalesData, SalesData } from '../services/api';

// Store Context
import { useStore } from '../contexts/StoreContext';

// Global data context to share data between components
const DashboardDataContext = React.createContext<{
  salesSummary: SalesSummary | null;
  menuStats: MenuStats | null;
  categorySales: CategorySales[] | null;
  transactionItems: TransactionItem[] | null;
  itemSales: ItemSalesData[] | null;
  storeSales: SalesData[] | null;
  fetchDashboardData?: (date: string, storeId?: number | null) => void;
  selectedStoreId: number | null;
}>({
  salesSummary: null,
  menuStats: null,
  categorySales: null,
  transactionItems: null,
  itemSales: null,
  storeSales: null,
  selectedStoreId: null
});

// Enhanced components that use data from context rather than fetching themselves
const DashboardSalesChart: React.FC<{ title: string; subtitle?: string }> = (props) => {
  const { storeSales } = React.useContext(DashboardDataContext);
  return <SalesChart {...props} preloadedData={storeSales || undefined} />;
};

const DashboardRevenueBreakdown: React.FC<{ title: string; subtitle?: string }> = (props) => {
  const { categorySales } = React.useContext(DashboardDataContext);
  return <RevenueBreakdown {...props} preloadedData={categorySales || undefined} />;
};

const DashboardRecentOrders: React.FC<{ title: string; subtitle?: string; onViewAll?: () => void }> = (props) => {
  const { transactionItems } = React.useContext(DashboardDataContext);
  return <RecentOrders {...props} preloadedData={transactionItems || undefined} />;
};

const DashboardPopularItems: React.FC<{ title: string; subtitle?: string; onViewAll?: () => void }> = (props) => {
  const { itemSales } = React.useContext(DashboardDataContext);
  return <PopularItems {...props} preloadedData={itemSales || undefined} />;
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
  
  // Get store from global context instead of local state
  const { selectedStoreId, selectedStore } = useStore();

  // Get dashboard data from context
  const { 
    salesSummary,
    fetchDashboardData
  } = useContext(DashboardDataContext);

  // State for loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch data when selected date or store changes
  useEffect(() => {
    console.log('Selected date or store changed:', selectedDate, 'store:', selectedStoreId);
    setIsLoading(true);
    
    // Force re-fetch data when store changes by triggering data fetching functions
    const fetchAllDashboardData = async () => {
      try {
        // These requests will be handled by the useApi hooks with their dependencies
        await Promise.all([
          dbApi.getSalesSummary(selectedDate, selectedStoreId),
          dbApi.getMenuStats(selectedDate, selectedStoreId),
          dbApi.getCategorySales(selectedDate, selectedStoreId),
          dbApi.getTransactionItems(selectedDate, selectedStoreId),
          dbApi.getItemSales(selectedDate, selectedStoreId),
          dbApi.getStoreSales(selectedDate, selectedStoreId)
        ]);
        
        console.log('All dashboard data fetched for store:', 
          selectedStore?.store_name || 'All Stores');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllDashboardData();
    
    if (fetchDashboardData) {
      fetchDashboardData(selectedDate, selectedStoreId);
    }
  }, [selectedDate, selectedStoreId, fetchDashboardData, selectedStore?.store_name]);
  
  const theme = useTheme();
  
  // Format the date for display
  const formattedDate = format(yesterday, 'EEEE, MMMM d, yyyy');
  
  // Log for debugging
  useEffect(() => {
    console.log('Dashboard rendering with date:', selectedDate, 'store:', selectedStoreId);
  }, [selectedDate, selectedStoreId]);
  
  // Store all API hooks with loading states
  const salesSummaryRequest = useApi(
    () => dbApi.getSalesSummary(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  const menuStatsRequest = useApi(
    () => dbApi.getMenuStats(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  const categorySalesRequest = useApi(
    () => dbApi.getCategorySales(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  const transactionItemsRequest = useApi(
    () => dbApi.getTransactionItems(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  const itemSalesRequest = useApi(
    () => dbApi.getItemSales(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  const storeSalesRequest = useApi(
    () => dbApi.getStoreSales(selectedDate, selectedStoreId),
    { deps: [selectedDate, selectedStoreId] }
  );

  // Extract data and loading states
  const { data: salesSummaryData, isLoading: isSalesSummaryLoading } = salesSummaryRequest;
  const { data: menuStatsData, isLoading: isMenuStatsLoading } = menuStatsRequest;
  const { data: categorySalesData, isLoading: isCategorySalesLoading } = categorySalesRequest;
  const { data: transactionItemsData, isLoading: isTransactionItemsLoading } = transactionItemsRequest;
  const { data: itemSalesData, isLoading: isItemSalesLoading } = itemSalesRequest;
  const { data: storeSalesData, isLoading: isStoreSalesLoading } = storeSalesRequest;
  
  // Combined data object for context
  const dashboardData = {
    salesSummary: salesSummaryData || null,
    menuStats: menuStatsData || null,
    categorySales: categorySalesData || null,
    transactionItems: transactionItemsData || null,
    itemSales: itemSalesData || null,
    storeSales: storeSalesData || null,
    fetchDashboardData,
    selectedStoreId
  };
  
  // Overall loading state for the dashboard
  const isDashboardLoading = isLoading || 
    isSalesSummaryLoading || 
    isMenuStatsLoading || 
    isCategorySalesLoading || 
    isTransactionItemsLoading || 
    isItemSalesLoading || 
    isStoreSalesLoading;
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  
  return (
    <DashboardDataContext.Provider value={dashboardData}>
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Global loading overlay */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            position: 'absolute'
          }}
          open={isDashboardLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

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
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <StoreSelector
                  useGlobalContext={true}
                  width={200}
                  label="Select Store"
                />
                
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  sx={{ width: 200 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formattedDate} {selectedStore ? ` • ${selectedStore.store_name}` : ' • All Stores'}
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
              isLoading={isSalesSummaryLoading}
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
              isLoading={isSalesSummaryLoading}
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
              isLoading={isSalesSummaryLoading}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
            <StatsCard
              title="Menu Items"
              value={menuStatsData?.menuItemCount || 0}
              suffix="items"
              icon={<StoreIcon />}
              color="warning"
              isLoading={isMenuStatsLoading}
            />
          </Box>
        </Box>

        {/* Sales Chart */}
        <Box sx={{ mb: 3, position: 'relative' }}>
          {isStoreSalesLoading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 1,
              borderRadius: 2
            }}>
              <CircularProgress />
            </Box>
          )}
          <DashboardSalesChart
            title={`Sales Overview${selectedStore ? ` - ${selectedStore.store_name}` : ''}`}
            subtitle="Track your restaurant's sales performance over time"
          />
        </Box>

        {/* Revenue Breakdown */}
        <Box sx={{ mb: 3, position: 'relative' }}>
          {isCategorySalesLoading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.7)',
              zIndex: 1,
              borderRadius: 2
            }}>
              <CircularProgress />
            </Box>
          )}
          <DashboardRevenueBreakdown
            title={`Revenue Breakdown${selectedStore ? ` - ${selectedStore.store_name}` : ''}`}
            subtitle="Sales distribution by food category"
          />
        </Box>

        {/* Orders and Popular Items */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
          <Box sx={{ width: { xs: '100%', lg: '58.33%' }, position: 'relative' }}>
            {isTransactionItemsLoading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                zIndex: 1,
                borderRadius: 2
              }}>
                <CircularProgress />
              </Box>
            )}
            <DashboardRecentOrders
              title={`Recent Orders${selectedStore ? ` - ${selectedStore.store_name}` : ''}`}
              subtitle="Latest orders from your customers"
              onViewAll={() => console.log('View all orders')}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', lg: '41.67%' }, position: 'relative' }}>
            {isItemSalesLoading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.7)',
                zIndex: 1,
                borderRadius: 2
              }}>
                <CircularProgress />
              </Box>
            )}
            <DashboardPopularItems
              title={`Popular Items${selectedStore ? ` - ${selectedStore.store_name}` : ''}`}
              subtitle="Best-selling items in your menu"
              onViewAll={() => console.log('View all menu items')}
            />
          </Box>
        </Box>
        
        {/* Refresh button for manual data refresh */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <IconButton 
            color="primary" 
            aria-label="refresh data"
            size="large"
            sx={{ 
              bgcolor: theme.palette.background.paper,
              boxShadow: 3,
              '&:hover': {
                bgcolor: theme.palette.background.paper,
              }
            }}
            onClick={() => {
              setIsLoading(true);
              Promise.all([
                dbApi.getSalesSummary(selectedDate, selectedStoreId),
                dbApi.getMenuStats(selectedDate, selectedStoreId),
                dbApi.getCategorySales(selectedDate, selectedStoreId),
                dbApi.getTransactionItems(selectedDate, selectedStoreId),
                dbApi.getItemSales(selectedDate, selectedStoreId),
                dbApi.getStoreSales(selectedDate, selectedStoreId)
              ]).finally(() => setIsLoading(false));
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
    </DashboardDataContext.Provider>
  );
};

const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Function to fetch dashboard data
  const fetchDashboardData = useCallback((date: string, storeId?: number | null) => {
    console.log('Fetching dashboard data for date:', date, 'store:', storeId);
    // Data is already fetched via useApi hooks with date as dependency
  }, []);
  
  // Combined data object for context
  const dashboardData = {
    salesSummary: null,
    menuStats: null,
    categorySales: null,
    transactionItems: null,
    itemSales: null,
    storeSales: null,
    fetchDashboardData,
    selectedStoreId: null
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
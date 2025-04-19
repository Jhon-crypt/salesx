import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Breadcrumbs, Link, useTheme, Paper, Stack, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// Components
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import RecentOrders from '../components/dashboard/RecentOrders';
import PopularItems from '../components/dashboard/PopularItems';
import RevenueBreakdown from '../components/dashboard/RevenueBreakdown';

// API and transformers
import apiService from '../services/apiService';
import { 
  generateStatsCardData, 
  transformPopularItems, 
  transformRevenueBreakdown,
  PopularItemData,
  RevenueBreakdownData,
  StatsCardData 
} from '../utils/dataTransformers';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  const [statsData, setStatsData] = useState<StatsCardData>({
    todaySales: 0,
    todayOrders: 0,
    todayCustomers: 0,
    menuItems: 84,
    salesTrend: 0,
    ordersTrend: 0,
    customersTrend: 0
  });

  const [popularItems, setPopularItems] = useState<PopularItemData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch sales data for stats card
        const salesData = await apiService.getStoreSales();
        if (salesData && salesData.length > 0) {
          const newStatsData = generateStatsCardData(salesData);
          setStatsData(newStatsData);
        }
        
        // Fetch item sales data for popular items and revenue breakdown
        const itemSalesData = await apiService.getItemSales();
        if (itemSalesData && itemSalesData.length > 0) {
          // Transform for popular items
          const popularItemsData = transformPopularItems(itemSalesData);
          setPopularItems(popularItemsData);
          
          // Transform for revenue breakdown
          const revenueBreakdownData = transformRevenueBreakdown(itemSalesData);
          setRevenueData(revenueBreakdownData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleViewAllOrders = () => {
    console.log('Navigate to all orders page');
    // Navigate to /sales/orders in a real implementation
  };

  const handleViewAllItems = () => {
    console.log('Navigate to all menu items');
    // Navigate to /menu/items in a real implementation
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
              </Typography>
            </Box>
            {!loading && statsData.salesTrend > 0 && (
              <Box sx={{ 
                py: 0.5, 
                px: 2, 
                borderRadius: 2, 
                backgroundColor: '#10b98120', 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 1 }} />
                <Typography 
                  variant="body2" 
                  color={theme.palette.success.main}
                  fontWeight="medium"
                >
                  Sales Up {Math.round(statsData.salesTrend)}% from yesterday
                </Typography>
              </Box>
            )}
          </Box>
          
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
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {today}
          </Typography>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
              <StatsCard
                title="Today's Sales"
                value={statsData.todaySales}
                prefix="$"
                trend={statsData.salesTrend}
                trendLabel="vs Yesterday"
                icon={<ReceiptIcon />}
                color="primary"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
              <StatsCard
                title="Active Orders"
                value={statsData.todayOrders}
                trend={statsData.ordersTrend}
                trendLabel="vs Yesterday"
                icon={<ShoppingCartIcon />}
                color="secondary"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
              <StatsCard
                title="Customers"
                value={statsData.todayCustomers}
                trend={statsData.customersTrend}
                trendLabel="vs Yesterday"
                icon={<GroupIcon />}
                color="success"
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
              <StatsCard
                title="Menu Items"
                value={statsData.menuItems}
                suffix="items"
                icon={<StoreIcon />}
                color="warning"
              />
            </Box>
          </Box>

          {/* Sales Chart */}
          <Box sx={{ mb: 3 }}>
            <SalesChart
              title="Sales Overview"
              subtitle="Track your restaurant's sales performance over time"
            />
          </Box>

          {/* Revenue Breakdown */}
          <Box sx={{ mb: 3 }}>
            <RevenueBreakdown
              title="Revenue Breakdown"
              subtitle="Sales distribution by food category"
              data={revenueData}
            />
          </Box>

          {/* Orders and Popular Items */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ width: { xs: '100%', lg: '58.33%' }}}>
              <RecentOrders
                title="Recent Orders"
                subtitle="Latest orders from your customers"
                onViewAll={handleViewAllOrders}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', lg: '41.67%' }}}>
              <PopularItems
                title="Popular Items"
                subtitle="Best-selling items in your menu"
                items={popularItems}
                onViewAll={handleViewAllItems}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 
import React from 'react';
import { Grid, Typography, Box, Breadcrumbs, Link, useTheme, Paper, Stack } from '@mui/material';
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

// Revenue breakdown data
const revenueCategories = [
  {
    name: 'Main Course',
    value: 1423.50,
    color: '#3f51b5',
    percentage: 48,
  },
  {
    name: 'Appetizers',
    value: 567.25,
    color: '#2196f3',
    percentage: 19,
  },
  {
    name: 'Desserts',
    value: 389.75,
    color: '#00bcd4',
    percentage: 13,
  },
  {
    name: 'Beverages',
    value: 324.50,
    color: '#4caf50',
    percentage: 11,
  },
  {
    name: 'Alcohol',
    value: 273.50,
    color: '#ff9800',
    percentage: 9,
  },
];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

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
                Sales Up 24% from last week
              </Typography>
            </Box>
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
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Today's Sales"
            value={2897.50}
            prefix="$"
            trend={12.5}
            trendLabel="vs Yesterday"
            icon={<ReceiptIcon />}
            color="primary"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Active Orders"
            value={37}
            trend={-5.3}
            trendLabel="vs Last Hour"
            icon={<ShoppingCartIcon />}
            color="secondary"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Customers"
            value={158}
            trend={8.1}
            trendLabel="vs Yesterday"
            icon={<GroupIcon />}
            color="success"
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }}}>
          <StatsCard
            title="Menu Items"
            value={84}
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
          data={revenueCategories}
        />
      </Box>

      {/* Orders and Popular Items */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', lg: '58.33%' }}}>
          <RecentOrders
            title="Recent Orders"
            subtitle="Latest orders from your customers"
            onViewAll={() => console.log('View all orders')}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', lg: '41.67%' }}}>
          <PopularItems
            title="Popular Items"
            subtitle="Best-selling items in your menu"
            onViewAll={() => console.log('View all menu items')}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 
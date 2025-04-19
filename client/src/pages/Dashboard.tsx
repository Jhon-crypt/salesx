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

// Sample Data
const recentOrders = [
  {
    id: '2587',
    customer: { name: 'John Smith', initial: 'JS' },
    items: 3,
    total: 49.99,
    status: 'completed' as const,
    date: '10 min ago',
    tableNumber: 5,
  },
  {
    id: '2586',
    customer: { name: 'Alice Johnson', initial: 'AJ' },
    items: 2,
    total: 28.50,
    status: 'in_progress' as const,
    date: '25 min ago',
    tableNumber: 3,
  },
  {
    id: '2585',
    customer: { name: 'Robert Williams', initial: 'RW' },
    items: 5,
    total: 76.20,
    status: 'pending' as const,
    date: '1 hour ago',
    tableNumber: 8,
  },
  {
    id: '2584',
    customer: { name: 'Emma Brown', initial: 'EB' },
    items: 1,
    total: 12.99,
    status: 'completed' as const,
    date: '2 hours ago',
    tableNumber: 2,
  },
  {
    id: '2583',
    customer: { name: 'David Miller', initial: 'DM' },
    items: 4,
    total: 55.75,
    status: 'cancelled' as const,
    date: '3 hours ago',
    tableNumber: 7,
  },
];

const popularItems = [
  {
    id: '1',
    name: 'Grilled Salmon',
    category: 'Main Course',
    popularity: 85,
    sales: 138,
    price: 22.99,
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    category: 'Pizza',
    popularity: 92,
    sales: 172,
    price: 16.99,
  },
  {
    id: '3',
    name: 'Caesar Salad',
    category: 'Salad',
    popularity: 78,
    sales: 94,
    price: 12.50,
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    category: 'Dessert',
    popularity: 88,
    sales: 116,
    price: 8.99,
  },
  {
    id: '5',
    name: 'Mango Smoothie',
    category: 'Beverages',
    popularity: 65,
    sales: 82,
    price: 5.99,
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Sales"
            value={2897.50}
            prefix="$"
            trend={12.5}
            trendLabel="vs Yesterday"
            icon={<ReceiptIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Orders"
            value={37}
            trend={-5.3}
            trendLabel="vs Last Hour"
            icon={<ShoppingCartIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Customers"
            value={158}
            trend={8.1}
            trendLabel="vs Yesterday"
            icon={<GroupIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Menu Items"
            value={84}
            suffix="items"
            icon={<StoreIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Sales Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <SalesChart
            title="Sales Overview"
            subtitle="Track your restaurant's sales performance over time"
          />
        </Grid>
      </Grid>

      {/* Orders and Popular Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <RecentOrders
            title="Recent Orders"
            subtitle="Latest orders from your customers"
            orders={recentOrders}
            onViewAll={() => console.log('View all orders')}
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <PopularItems
            title="Popular Items"
            subtitle="Best-selling items in your menu"
            items={popularItems}
            onViewAll={() => console.log('View all menu items')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
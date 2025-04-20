import React, { useState, useEffect } from 'react';
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

// API hooks
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  // Fetch dashboard data from API
  const { data: salesSummary, isLoading: isLoadingSales } = useApi(() => dbApi.getSalesSummary());
  const { data: menuStats, isLoading: isLoadingMenu } = useApi(() => dbApi.getMenuStats());
  
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
            value={salesSummary?.todaySales || 0}
            prefix="$"
            trend={salesSummary?.salesTrend}
            trendLabel="vs Yesterday"
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Stack,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, subDays, parse, isValid } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import useApi from '../hooks/useApi';
import { dbApi, SalesData } from '../services/api';
import { useStore } from '../contexts/StoreContext';

// Define tabs for report views
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Tabs options
const a11yProps = (index: number) => {
  return {
    id: `sales-tab-${index}`,
    'aria-controls': `sales-tabpanel-${index}`,
  };
};

// Styled components
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TrendIndicator = ({ value }: { value: number }) => {
  const color = value >= 0 ? 'success.main' : 'error.main';
  const Icon = value >= 0 ? TrendingUpIcon : TrendingDownIcon;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', color }}>
      <Icon fontSize="small" sx={{ mr: 0.5 }} />
      <Typography variant="body2" component="span" fontWeight="medium" sx={{ color }}>
        {Math.abs(value).toFixed(1)}%
      </Typography>
    </Box>
  );
};

const SalesReport: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('2023-09-01');
  
  // Use global store context
  const { selectedStoreId, selectedStore } = useStore();

  // Fetch data with store filter
  const { data: salesData, isLoading: isLoadingSales } = useApi(
    () => dbApi.getStoreSales(dateFilter, selectedStoreId),
    { deps: [dateFilter, selectedStoreId] }
  );

  // Title helper that includes store name
  const getReportTitle = () => {
    const baseTitle = "Sales Report";
    return selectedStore 
      ? `${baseTitle} - ${selectedStore.store_name}` 
      : `${baseTitle} - All Stores`;
  };

  // State for filters and data display
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  
  // Process and prepare data when raw data changes or filters change
  useEffect(() => {
    if (!salesData) return;
    
    let filtered = [...salesData];
    
    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isValid(start) && isValid(end)) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.transaction_date);
          return itemDate >= start && itemDate <= end;
        });
      }
    }
    
    // Filter by store
    if (storeFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.store_id.toString() === storeFilter.toString()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.store_name && item.store_name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Sort by date ascending for charts
    filtered.sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );
    
    setFilteredData(filtered);
  }, [salesData, startDate, endDate, storeFilter, searchTerm]);
  
  // Handle filter changes
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };
  
  const handleStoreFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoreFilter(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Calculate summary stats
  const totalSales = filteredData.reduce((sum, item) => sum + item.daily_sales, 0);
  const totalOrders = filteredData.reduce((sum, item) => sum + item.check_count, 0);
  const totalCustomers = filteredData.reduce((sum, item) => sum + item.guest_count, 0);
  
  // Calculate averages
  const avgDailySales = totalSales / Math.max(filteredData.length, 1);
  const avgOrderValue = totalSales / Math.max(totalOrders, 1);
  const avgCustomersPerDay = totalCustomers / Math.max(filteredData.length, 1);
  
  // Calculate trends - compare first half of period to second half if enough data
  let salesTrend = 0;
  let ordersCountTrend = 0;
  let customersCountTrend = 0;
  
  if (filteredData.length >= 2) {
    const midPoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midPoint);
    const secondHalf = filteredData.slice(midPoint);
    
    const firstHalfSales = firstHalf.reduce((sum, item) => sum + item.daily_sales, 0);
    const secondHalfSales = secondHalf.reduce((sum, item) => sum + item.daily_sales, 0);
    
    const firstHalfOrders = firstHalf.reduce((sum, item) => sum + item.check_count, 0);
    const secondHalfOrders = secondHalf.reduce((sum, item) => sum + item.check_count, 0);
    
    const firstHalfCustomers = firstHalf.reduce((sum, item) => sum + item.guest_count, 0);
    const secondHalfCustomers = secondHalf.reduce((sum, item) => sum + item.guest_count, 0);
    
    if (firstHalfSales > 0) {
      salesTrend = ((secondHalfSales - firstHalfSales) / firstHalfSales) * 100;
    }
    
    if (firstHalfOrders > 0) {
      ordersCountTrend = ((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100;
    }
    
    if (firstHalfCustomers > 0) {
      customersCountTrend = ((secondHalfCustomers - firstHalfCustomers) / firstHalfCustomers) * 100;
    }
  }
  
  // Format data for charts
  const chartData = filteredData.map(item => ({
    date: format(new Date(item.transaction_date), 'MMM dd'),
    sales: item.daily_sales,
    orders: item.check_count,
    customers: item.guest_count,
    store: item.store_name || `Store ${item.store_id}`
  }));
  
  // Get unique stores for the filter
  const uniqueStores = salesData 
    ? Array.from(new Set(salesData.map(item => item.store_id)))
        .map(storeId => {
          const storeData = salesData.find(item => item.store_id === storeId);
          return {
            id: storeId,
            name: storeData?.store_name || `Store ${storeId}`
          };
        })
    : [];
  
  // Simulate export functionality
  const handleExport = () => {
    alert('Export functionality would be implemented here');
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
                {getReportTitle()}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Analyze sales performance across time periods and stores
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export Data
            </Button>
          </Box>
          
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Sales Report
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Sales
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${totalSales.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Typography>
            {salesTrend !== 0 && <TrendIndicator value={salesTrend} />}
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalOrders.toLocaleString()}
            </Typography>
            {ordersCountTrend !== 0 && <TrendIndicator value={ordersCountTrend} />}
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Customers
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalCustomers.toLocaleString()}
            </Typography>
            {customersCountTrend !== 0 && <TrendIndicator value={customersCountTrend} />}
          </CardContent>
        </StatCard>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 1 } }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 1 } }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Store"
              value={storeFilter}
              onChange={handleStoreFilterChange}
              sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 1 } }}
            >
              <MenuItem value="all">All Stores</MenuItem>
              {uniqueStores.map((store) => (
                <MenuItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 1 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : isLoadingSales ? (
        <Typography color="error">
          Error loading sales data: {error.message}
        </Typography>
      ) : filteredData.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No sales data found for the selected criteria
        </Typography>
      ) : (
        <>
          {/* Tabs for different views */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="sales report tabs">
              <Tab label="Charts" {...a11yProps(0)} />
              <Tab label="Data Table" {...a11yProps(1)} />
            </Tabs>
          </Box>
          
          {/* Charts Panel */}
          <TabPanel value={activeTab} index={0}>
            {/* Sales Trend Chart */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Sales Trend
            </Typography>
            <Card sx={{ mb: 4, p: 2 }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    tick={{ fill: '#888888', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#888888"
                    tick={{ fill: '#888888', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [`$${value}`, 'Sales']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#3f51b5"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            
            {/* Orders Chart */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Orders vs Customers
            </Typography>
            <Card sx={{ mb: 4, p: 2 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888"
                    tick={{ fill: '#888888', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#888888"
                    tick={{ fill: '#888888', fontSize: 12 }}
                  />
                  <RechartsTooltip />
                  <Legend />
                  <Bar 
                    dataKey="orders" 
                    name="Orders"
                    fill="#2196f3" 
                  />
                  <Bar 
                    dataKey="customers" 
                    name="Customers"
                    fill="#4caf50" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabPanel>
          
          {/* Data Table Panel */}
          <TabPanel value={activeTab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Customers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={`${item.store_id}-${item.transaction_date}-${index}`} hover>
                      <TableCell>
                        {format(new Date(item.transaction_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{item.store_name || `Store ${item.store_id}`}</TableCell>
                      <TableCell align="right">${item.daily_sales.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.check_count}</TableCell>
                      <TableCell align="right">{item.guest_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default SalesReport; 
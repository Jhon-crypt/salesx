import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
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
  Tabs,
  Tab,
  Stack,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, subDays, isValid } from 'date-fns';
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
import { useStoreContext } from '../contexts/StoreContext';
import StoreSelector from '../components/common/StoreSelector';
import DatePicker from '../components/common/DatePicker';
import { getDefaultDateRange, getLast30DaysRange, formatDateForDisplay } from '../utils/dateUtils';

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
  padding: theme.spacing(2),
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
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  
  // State for filters and data display
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  
  // Get store context for filtering
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();
  
  // Fetch sales data
  const { data: salesData, isLoading, error } = useApi(
    () => dbApi.getStoreSales(startDate, endDate, selectedStoreId),
    { deps: [startDate, endDate, selectedStoreId] }
  );
  
  // Add debugging logs
  console.log('SalesReport API Response:', {
    isLoading,
    error,
    salesData: salesData?.length || 0,
    startDate,
    endDate,
    selectedStoreId
  });
  
  // Process and prepare data when raw data changes or filters change
  useEffect(() => {
    if (!salesData) {
      console.log('No sales data available');
      return;
    }
    
    console.log(`Processing ${salesData.length} sales records`);
    let filtered = [...salesData];
    
    // Filter by date range
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Add one day to end date to include the end date in the range
        const adjustedEnd = new Date(end);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        
        console.log('Sales date range:', {
          startFormatted: start.toISOString(),
          endFormatted: end.toISOString(),
          adjustedEndFormatted: adjustedEnd.toISOString()
        });
        
        if (isValid(start) && isValid(adjustedEnd)) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.transaction_date);
            // Use direct comparison instead of interval check
            const isWithin = itemDate >= start && itemDate < adjustedEnd;
            
            if (!isWithin) {
              console.log('Filtering out sales record due to date:', {
                storeId: item.store_id,
                storeName: item.store_name,
                dateISO: itemDate.toISOString(),
                dateString: itemDate.toString(),
                start: start.toISOString(),
                end: adjustedEnd.toISOString()
              });
            }
            return isWithin;
          });
        }
      } catch (error) {
        console.error('Error filtering sales by date:', error);
      }
    }
    
    console.log('After date filter:', filtered.length);
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.store_name && item.store_name.toLowerCase().includes(lowerSearchTerm))
      );
      console.log('After search filter:', filtered.length);
    }
    
    // Sort by date ascending for charts
    filtered.sort((a, b) => 
      new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );
    
    console.log('Final filtered sales data:', filtered.length);
    setFilteredData(filtered);
  }, [salesData, startDate, endDate, searchTerm]);
  
  // Handle filter changes
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
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
    date: formatDateForDisplay(item.transaction_date),
    sales: item.daily_sales,
    orders: item.check_count,
    customers: item.guest_count,
    store: item.store_name || `Store ${item.store_id}`
  }));
  
  // Adjust tooltip formatter to handle string type
  const formatSalesValue = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `$${numValue}`;
  };
  
  // Simulate export functionality
  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };
  
  const handleViewLast30Days = () => {
    const { startDate: newStartDate, endDate: newEndDate } = getLast30DaysRange();
    setStartDate(newStartDate);
    setEndDate(newEndDate);
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
                Sales Report
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Analyze sales performance across time periods and stores
                {selectedStore && (
                  <> for <b>{selectedStore.store_name}</b></>
                )}
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

      {/* Additional Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Avg. Daily Sales
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${avgDailySales.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Avg. Order Value
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Typography>
          </CardContent>
        </StatCard>

        <StatCard sx={{ flex: '1 1 calc(33% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Avg. Customers/Day
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {avgCustomersPerDay.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Typography>
          </CardContent>
        </StatCard>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    sx={{ width: '100%' }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    sx={{ width: '100%' }}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleViewLast30Days}
                    sx={{ whiteSpace: 'nowrap', height: '40px' }}
                  >
                    Last 30 Days
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Search stores"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by store name..."
                />
                
                <StoreSelector 
                  stores={stores}
                  selectedStoreId={selectedStoreId}
                  onChange={setSelectedStoreId}
                  size="small"
                  label="Filter by store"
                  showCount={false}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
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
                    tickFormatter={formatSalesValue}
                  />
                  <RechartsTooltip 
                    formatter={(value: number | string) => [`${formatSalesValue(value)}`, 'Sales']}
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
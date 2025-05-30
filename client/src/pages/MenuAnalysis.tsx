import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from '../components/common/DatePicker';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DownloadIcon from '@mui/icons-material/Download';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';
import { format, subDays, parseISO } from 'date-fns';
import { useStoreContext } from '../contexts/StoreContext';
import StoreSelector from '../components/common/StoreSelector';

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
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
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
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
};

// Styled components
const PerformanceChip = styled(Chip)<{ performance: 'high' | 'medium' | 'low' }>(({ theme, performance }) => {
  let color;
  switch (performance) {
    case 'high':
      color = theme.palette.success.main;
      break;
    case 'medium':
      color = theme.palette.warning.main;
      break;
    case 'low':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.info.main;
  }

  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 'bold',
    fontSize: '0.75rem',
  };
});

// Process item sales data for better display
interface ProcessedItemSale {
  id: number;
  name: string;
  store: string;
  quantity: number;
  sales: number;
  performance: 'high' | 'medium' | 'low';
  date: string;
}

const MenuAnalysis: React.FC = () => {
  const theme = useTheme();
  // State for filters and data display
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('sales');
  const [activeTab, setActiveTab] = useState(0);
  const [filteredItems, setFilteredItems] = useState<ProcessedItemSale[]>([]);
  const yesterday = useMemo(() => format(subDays(new Date(), 1), 'yyyy-MM-dd'), []);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);
  
  // Get store context for filtering
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();
  
  // Fetch data with improved debugging
  const { data: itemSales, isLoading: isLoadingItems, error: itemsError } = useApi(
    () => dbApi.getItemSales(startDate, endDate, selectedStoreId),
    { deps: [startDate, endDate, selectedStoreId] }
  );
  
  // Add debugging logs
  console.log('MenuAnalysis API Response:', {
    isLoadingItems,
    itemsError,
    itemSalesCount: itemSales?.length || 0,
    startDate,
    endDate,
    selectedStoreId
  });
  
  const { data: categorySales, isLoading: isLoadingCategories, error: categoriesError } = useApi(
    () => dbApi.getCategorySales(startDate, endDate, selectedStoreId),
    { deps: [startDate, endDate, selectedStoreId] }
  );
  
  // Process and prepare data when raw data changes or filters change
  useEffect(() => {
    if (!itemSales) {
      console.log('No item sales data available');
      return;
    }
    
    console.log(`Processing ${itemSales.length} menu items`);
    
    // Find maximum sales to determine performance
    const maxSales = Math.max(...itemSales.map(item => item.sales_amount));
    const maxQuantity = Math.max(...itemSales.map(item => item.quantity_sold));
    
    // Process raw data
    const processed: ProcessedItemSale[] = itemSales.map(item => {
      // Determine performance based on sales and quantity
      let performance: 'high' | 'medium' | 'low';
      const salesRatio = item.sales_amount / maxSales;
      const quantityRatio = item.quantity_sold / maxQuantity;
      
      if (salesRatio > 0.7 || quantityRatio > 0.7) {
        performance = 'high';
      } else if (salesRatio > 0.3 || quantityRatio > 0.3) {
        performance = 'medium';
      } else {
        performance = 'low';
      }
      
      return {
        id: item.item_number,
        name: item.item_name,
        store: item.store_name || `Store ${item.store_id}`,
        quantity: item.quantity_sold,
        sales: item.sales_amount,
        performance,
        date: item.sale_date
      };
    });
    
    // Apply filters
    let filtered = [...processed];
    
    // Date filter for date range
    if (startDate && endDate) {
      try {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        // Add one day to end date to include the end date in the range
        const adjustedEnd = new Date(end);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        
        console.log('Menu date range:', {
          startFormatted: start.toISOString(),
          endFormatted: end.toISOString(),
          adjustedEndFormatted: adjustedEnd.toISOString()
        });
        
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.date);
          // Use direct comparison instead of interval check
          const isWithin = itemDate >= start && itemDate < adjustedEnd;
          
          // Only log items being filtered out for troubleshooting
          if (!isWithin) {
            console.log('Filtering out menu item due to date:', {
              itemName: item.name,
              itemId: item.id,
              dateISO: itemDate.toISOString(),
              start: start.toISOString(),
              end: adjustedEnd.toISOString()
            });
          }
          return isWithin;
        });
      } catch (error) {
        console.error('Error filtering menu items by date:', error);
      }
    }
    
    console.log('After date filter:', filtered.length);
    
    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerSearchTerm) || 
        item.store.toLowerCase().includes(lowerSearchTerm)
      );
      console.log('After search filter:', filtered.length);
    }
    
    // Sort items
    switch (sortBy) {
      case 'sales':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'quantity':
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => b.sales - a.sales);
    }
    
    console.log('Final filtered menu items:', filtered.length);
    setFilteredItems(filtered);
  }, [itemSales, startDate, endDate, searchTerm, sortBy]);
  
  // Handle filter changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };
  
  // Add a function to view the last 30 days of data
  const handleViewLast30Days = () => {
    const today = new Date();
    const last30Days = format(subDays(today, 30), 'yyyy-MM-dd');
    const todayFormatted = format(today, 'yyyy-MM-dd');
    
    console.log('Setting date range to last 30 days:', { 
      from: last30Days, 
      to: todayFormatted 
    });
    
    setStartDate(last30Days);
    setEndDate(todayFormatted);
  };
  
  // Format data for charts
  const topItems = filteredItems.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    sales: item.sales,
    quantity: item.quantity
  }));
  
  // Export data function
  const handleExport = () => {
    // In a real app, this would generate a CSV or Excel file
    alert('Export functionality would be implemented here');
  };
  
  // Check if data is loading
  const isLoading = isLoadingItems || isLoadingCategories;
  const hasError = itemsError || categoriesError;
  
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
                Menu Analysis
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Track performance of menu items across stores
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
            <Link
              underline="hover"
              color="inherit"
              href="/menu"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <MenuBookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Menu
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Menu Analysis
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                label="Search items..."
                value={searchTerm}
                onChange={handleSearchChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                select
                label="Sort By"
                value={sortBy}
                onChange={handleSortChange}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="sales">Sales Amount</MenuItem>
                <MenuItem value="quantity">Quantity Sold</MenuItem>
                <MenuItem value="name">Item Name</MenuItem>
              </TextField>
              
              <StoreSelector
                stores={stores}
                selectedStoreId={selectedStoreId}
                onChange={setSelectedStoreId}
                size="small"
                showCount={false}
                label="Filter by store"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="menu analysis tabs">
          <Tab label="Item Performance" {...a11yProps(0)} />
          <Tab label="Category Analysis" {...a11yProps(1)} />
          <Tab label="Sales Trends" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : hasError ? (
        <Typography color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportProblemIcon color="error" />
          Error loading menu data: {itemsError?.message || categoriesError?.message}
        </Typography>
      ) : filteredItems.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No menu items found matching your criteria
        </Typography>
      ) : (
        <>
          {/* Stats Summary */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Card sx={{ flex: '1 0 280px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Menu Items
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {filteredItems.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: '1 0 280px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Top Selling Item
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {filteredItems.length > 0 ? filteredItems[0].name : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: '1 0 280px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ fontSize: 40, color: 'success.main', mr: 2, fontWeight: 'bold' }}>$</Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${filteredItems.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Tabs */}
          <TabPanel value={activeTab} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Total Sales</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow key={`${item.id}-${item.store}-${index}`} hover>
                      <TableCell>{item.name || `Item #${item.id}`}</TableCell>
                      <TableCell>{item.store}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.sales.toFixed(2)}</TableCell>
                      <TableCell>
                        <PerformanceChip
                          label={item.performance === 'high' ? 'High' : item.performance === 'medium' ? 'Medium' : 'Low'}
                          performance={item.performance}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          
          {/* Category Analysis Tab */}
          <TabPanel value={activeTab} index={1}>
            {categorySales && categorySales.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Pie Chart */}
                <Card sx={{ flex: 1, minHeight: 400 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sales by Category
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={categorySales}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={130}
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categorySales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`$${value}`, 'Sales']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Category Table */}
                <Card sx={{ flex: 1 }}>
                  <CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Category Breakdown
                    </Typography>
                    <TableContainer sx={{ maxHeight: 350 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Sales</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categorySales.map((category, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      bgcolor: category.color,
                                      borderRadius: '50%',
                                      mr: 1,
                                    }}
                                  />
                                  {category.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">${category.value.toFixed(2)}</TableCell>
                              <TableCell align="right">{category.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
                No category data available
              </Typography>
            )}
          </TabPanel>
          
          {/* Performance Charts Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top 10 Items by Sales
            </Typography>
            <Card sx={{ mb: 4, p: 2 }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    name="Sales ($)"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="quantity"
                    name="Quantity Sold"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default MenuAnalysis; 
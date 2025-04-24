import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import { format, subDays } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import useApi from '../hooks/useApi';
import { dbApi, ItemSalesByHour } from '../services/api';
import { useStoreContext } from '../contexts/StoreContext';
import StoreSelector from '../components/common/StoreSelector';

interface MenuItemOption {
  id: number;
  name: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
}));

const MenuItemsByHour: React.FC = () => {
  const theme = useTheme();
  const yesterday = useMemo(() => format(subDays(new Date(), 1), 'yyyy-MM-dd'), []);
  
  // State for filters and data display
  const [selectedDate, setSelectedDate] = useState<string>(yesterday);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [filteredData, setFilteredData] = useState<ItemSalesByHour[]>([]);
  
  // Get store context for filtering
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();
  
  // Fetch all menu items for the dropdown
  const { data: allItemSales } = useApi(() => dbApi.getItemSales(selectedDate, selectedStoreId), {
    deps: [selectedDate, selectedStoreId]
  });
  
  // Fetch hourly data
  const { data: hourlyData, isLoading, error } = useApi(
    () => dbApi.getItemSalesByHour(selectedDate, selectedStoreId, selectedMenuItem),
    { deps: [selectedDate, selectedStoreId, selectedMenuItem] }
  );
  
  // Process menu items for dropdown when itemSales data changes
  useEffect(() => {
    if (!allItemSales) return;
    
    // Get unique menu items
    const uniqueItems = new Map<number, MenuItemOption>();
    
    allItemSales.forEach(item => {
      if (!uniqueItems.has(item.item_number)) {
        uniqueItems.set(item.item_number, {
          id: item.item_number,
          name: item.item_name
        });
      }
    });
    
    // Convert to array and sort by name
    const itemsArray = Array.from(uniqueItems.values());
    itemsArray.sort((a, b) => a.name.localeCompare(b.name));
    
    setMenuItems(itemsArray);
  }, [allItemSales]);
  
  // Filter and process hourly data
  useEffect(() => {
    if (!hourlyData) return;
    
    let filtered = [...hourlyData];
    
    // Filter by search term if any
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Sort by hour
    filtered.sort((a, b) => a.hour - b.hour);
    
    setFilteredData(filtered);
  }, [hourlyData, searchTerm]);
  
  // Handle filter changes
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleMenuItemChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    setSelectedMenuItem(value === 'all' ? null : Number(value));
  };
  
  // Calculate totals
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity_sold, 0);
  const totalSales = filteredData.reduce((sum, item) => sum + item.sales_amount, 0);
  
  // Prepare data for chart
  const chartData = useMemo(() => {
    // Initialize array with all 24 hours
    const hourlyChartData = HOURS.map(hour => ({
      hour: hour.hour,
      hourLabel: hour.label,
      quantity: 0,
      sales: 0
    }));
    
    // Fill in data where we have it
    filteredData.forEach(item => {
      const hourIndex = hourlyChartData.findIndex(h => h.hour === item.hour);
      if (hourIndex !== -1) {
        hourlyChartData[hourIndex].quantity += item.quantity_sold;
        hourlyChartData[hourIndex].sales += item.sales_amount;
      }
    });
    
    return hourlyChartData;
  }, [filteredData]);
  
  // Export to CSV function
  const handleExport = () => {
    // Create CSV content
    const headers = ['Hour', 'Item Name', 'Item Number', 'Store', 'Quantity Sold', 'Sales Amount'];
    const csvRows = [
      headers.join(','),
      ...filteredData.map(item => [
        item.hour,
        `"${item.item_name}"`, // Quote item name to handle commas
        item.item_number,
        `"${item.store_name}"`,
        item.quantity_sold,
        item.sales_amount.toFixed(2)
      ].join(','))
    ];
    
    // Create blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `menu-items-by-hour-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                Menu Items by Hour
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Track hourly sales of menu items across stores
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
              <HourglassTopIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Menu Items by Hour
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
              <StoreSelector
                stores={stores}
                selectedStoreId={selectedStoreId}
                onChange={setSelectedStoreId}
                size="small"
                showCount={false}
              />
            </Box>
            
            <FormControl sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel id="menu-item-select-label">Menu Item</InputLabel>
              <Select
                labelId="menu-item-select-label"
                id="menu-item-select"
                value={selectedMenuItem === null ? 'all' : selectedMenuItem}
                label="Menu Item"
                onChange={handleMenuItemChange}
              >
                <MenuItem value="all">All Menu Items</MenuItem>
                {menuItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
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

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Items Sold
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalQuantity}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 calc(50% - 16px)', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ fontSize: 40, color: 'success.main', mr: 2, fontWeight: 'bold' }}>$</Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Sales
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalSales.toFixed(2)}
                </Typography>
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
          Error loading menu item data: {error.message}
        </Typography>
      ) : filteredData.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No menu item data found for the selected criteria
        </Typography>
      ) : (
        <>
          {/* Hourly Chart */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedMenuItem === null ? 'All Menu Items' : menuItems.find(item => item.id === selectedMenuItem)?.name} - Hourly Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hourLabel" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      label={{ 
                        value: 'Quantity', 
                        angle: -90, 
                        position: 'insideLeft'
                      }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `$${value}`}
                      label={{ 
                        value: 'Sales ($)', 
                        angle: 90, 
                        position: 'insideRight'
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'Sales') return [`$${Number(value).toFixed(2)}`, name];
                        return [value, name];
                      }} 
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="quantity" 
                      name="Quantity" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sales" 
                      name="Sales" 
                      stroke={theme.palette.success.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Detailed Hourly Data
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hour</TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell align="right">Quantity Sold</TableCell>
                      <TableCell align="right">Sales Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={`${item.item_number}-${item.hour}-${index}`} hover>
                        <TableCell>
                          {item.hour === 0 ? '12 AM' : 
                           item.hour < 12 ? `${item.hour} AM` : 
                           item.hour === 12 ? '12 PM' : 
                           `${item.hour - 12} PM`}
                        </TableCell>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>{item.store_name}</TableCell>
                        <TableCell align="right">{item.quantity_sold}</TableCell>
                        <TableCell align="right">${item.sales_amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MenuItemsByHour; 
import React, { useState, useMemo } from 'react';
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
  Stack,
  Breadcrumbs,
  Link,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tabs,
  Tab,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Line
} from 'recharts';
import { format } from 'date-fns';
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';
import { useStoreContext } from '../contexts/StoreContext';
import StoreSelector from '../components/common/StoreSelector';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';

// Tab panel component
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
      id={`hourly-sales-tabpanel-${index}`}
      aria-labelledby={`hourly-sales-tab-${index}`}
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

const a11yProps = (index: number) => {
  return {
    id: `hourly-sales-tab-${index}`,
    'aria-controls': `hourly-sales-tabpanel-${index}`,
  };
};

const HourlyItemSales: React.FC = () => {
  const theme = useTheme();
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);

  // State for filters
  const [dateFilter, setDateFilter] = useState(format(yesterday, 'yyyy-MM-dd'));
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Get store context
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();

  // Fetch available menu items
  const { data: menuItems, isLoading: isLoadingItems } = useApi(
    () => dbApi.getItemSales(dateFilter, selectedStoreId),
    { deps: [dateFilter, selectedStoreId] }
  );

  // Fetch hourly sales data
  const { data: hourlySalesData, isLoading: isLoadingHourlyData, error: hourlyDataError } = useApi(
    () => dbApi.getHourlyItemSales(dateFilter, selectedStoreId, selectedItemId),
    { deps: [dateFilter, selectedStoreId, selectedItemId] }
  );

  // Handle filter changes
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value);
  };

  const handleItemChange = (event: SelectChangeEvent<string | number>) => {
    setSelectedItemId(event.target.value as number || null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format data for charts - add empty hours as zeros if needed
  const chartData = useMemo(() => {
    if (!hourlySalesData) return [];
    return hourlySalesData.map(hourData => ({
      ...hourData,
      formattedHour: `${hourData.hour}:00`
    }));
  }, [hourlySalesData]);

  // Get selected item detail
  const selectedItem = useMemo(() => {
    if (!selectedItemId || !menuItems) return null;
    return menuItems.find(item => item.item_number === selectedItemId);
  }, [selectedItemId, menuItems]);

  // Loading state
  const isLoading = isLoadingItems || isLoadingHourlyData;

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
                Hourly Item Sales
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Track menu item performance by hour
                {selectedStore && (
                  <> for <b>{selectedStore.store_name}</b></>
                )}
              </Typography>
            </Box>
            <AccessTimeIcon sx={{ fontSize: 40, opacity: 0.7 }} />
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
              href="/menu-analysis"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <RestaurantIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Menu Analysis
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <ShowChartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Hourly Item Sales
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
              value={dateFilter}
              onChange={handleDateChange}
              sx={{ minWidth: 200 }}
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ minWidth: 200, flex: 1 }}>
              <StoreSelector
                stores={stores}
                selectedStoreId={selectedStoreId}
                onChange={setSelectedStoreId}
                size="small"
                showCount={false}
              />
            </Box>
            
            <FormControl sx={{ minWidth: 250, flex: 1 }}>
              <InputLabel id="item-select-label">Menu Item</InputLabel>
              <Select
                labelId="item-select-label"
                value={selectedItemId || ''}
                onChange={handleItemChange}
                label="Menu Item"
                displayEmpty
              >
                <MenuItem value="">
                  <em>All items (top performing)</em>
                </MenuItem>
                {menuItems?.map((item) => (
                  <MenuItem key={item.item_number} value={item.item_number}>
                    {item.item_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Item Sales Info */}
      {selectedItem && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestaurantIcon color="primary" />
            <Typography variant="h6">{selectedItem.item_name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
            <Box sx={{ pr: 4, minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Total Quantity Sold</Typography>
              <Typography variant="h6">{selectedItem.quantity_sold}</Typography>
            </Box>
            <Box sx={{ pr: 4, minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Total Sales</Typography>
              <Typography variant="h6">${selectedItem.sales_amount?.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ pr: 4, minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">Average Price</Typography>
              <Typography variant="h6">
                ${(selectedItem.sales_amount / selectedItem.quantity_sold)?.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="hourly sales tabs">
          <Tab label="Chart View" {...a11yProps(0)} />
          <Tab label="Table View" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : hourlyDataError ? (
        <Typography color="error" sx={{ mt: 3 }}>
          Error loading hourly sales data: {hourlyDataError.message}
        </Typography>
      ) : (
        <>
          {/* Chart View */}
          <TabPanel value={activeTab} index={0}>
            {selectedItemId ? (
              // Single item hourly chart
              <Card sx={{ mb: 4, p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Hourly Sales for {selectedItem?.item_name}
                  </Typography>
                  <Tooltip title="Shows sales by hour for the selected date">
                    <InfoIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />
                  </Tooltip>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour_label" 
                      label={{ 
                        value: 'Hour of Day', 
                        position: 'insideBottom', 
                        offset: -10 
                      }}
                    />
                    <YAxis 
                      yAxisId="left"
                      label={{ 
                        value: 'Quantity Sold', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' },
                        offset: -5
                      }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      label={{ 
                        value: 'Sales Amount ($)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle' },
                        offset: 5
                      }}
                    />
                    <RechartsTooltip formatter={(value, name) => {
                      if (name === 'Sales Amount') return [`$${value}`, name];
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      name="Quantity Sold" 
                      dataKey="quantity_sold" 
                      fill={theme.palette.primary.main} 
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      name="Sales Amount"
                      type="monotone"
                      dataKey="sales_amount"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              // Multiple items comparison chart - top 5 items by quantity
              <Card sx={{ mb: 4, p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Top Selling Items by Hour
                  </Typography>
                  <Tooltip title="Shows top 5 items by quantity sold for each hour">
                    <InfoIcon fontSize="small" sx={{ ml: 1, opacity: 0.7 }} />
                  </Tooltip>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hourlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour_label" 
                      label={{ 
                        value: 'Hour of Day', 
                        position: 'insideBottom', 
                        offset: -10 
                      }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Quantity Sold', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <RechartsTooltip 
                      formatter={(value, name, props) => {
                        if (name === 'quantity_sold') {
                          return [value, `${props.payload.item_name}`];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      name="Quantity Sold" 
                      dataKey="quantity_sold" 
                      fill={theme.palette.primary.main}
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
              
            {/* Peak Hours Summary */}
            {hourlySalesData && hourlySalesData.length > 0 && (
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Peak Hours Analysis
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Card sx={{ flex: '1 0 280px', p: 2, boxShadow: theme.shadows[2] }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Peak Hour by Quantity
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {
                        [...hourlySalesData]
                          .sort((a, b) => b.quantity_sold - a.quantity_sold)[0]?.hour_label
                      }
                    </Typography>
                    <Typography variant="body2">
                      {
                        [...hourlySalesData]
                          .sort((a, b) => b.quantity_sold - a.quantity_sold)[0]?.quantity_sold
                      } units sold
                    </Typography>
                  </Card>
                  
                  <Card sx={{ flex: '1 0 280px', p: 2, boxShadow: theme.shadows[2] }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Peak Hour by Sales
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {
                        [...hourlySalesData]
                          .sort((a, b) => b.sales_amount - a.sales_amount)[0]?.hour_label
                      }
                    </Typography>
                    <Typography variant="body2">
                      ${
                        [...hourlySalesData]
                          .sort((a, b) => b.sales_amount - a.sales_amount)[0]?.sales_amount.toFixed(2)
                      }
                    </Typography>
                  </Card>
                  
                  <Card sx={{ flex: '1 0 280px', p: 2, boxShadow: theme.shadows[2] }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Active Hours
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {hourlySalesData.filter(h => h.quantity_sold > 0).length}
                    </Typography>
                    <Typography variant="body2">
                      out of 24 hours
                    </Typography>
                  </Card>
                </Box>
              </Card>
            )}
          </TabPanel>
          
          {/* Table View */}
          <TabPanel value={activeTab} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Hour</TableCell>
                    {!selectedItemId && <TableCell>Item Name</TableCell>}
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Sales Amount</TableCell>
                    {selectedItemId && <TableCell align="right">Average Price</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hourlySalesData && hourlySalesData.length > 0 ? (
                    hourlySalesData.map((hourData, index) => (
                      <TableRow key={`${hourData.hour}-${hourData.item_number}-${index}`} hover>
                        <TableCell>{hourData.hour_label}</TableCell>
                        {!selectedItemId && <TableCell>{hourData.item_name}</TableCell>}
                        <TableCell align="right">{hourData.quantity_sold}</TableCell>
                        <TableCell align="right">${hourData.sales_amount.toFixed(2)}</TableCell>
                        {selectedItemId && (
                          <TableCell align="right">
                            ${hourData.quantity_sold > 0 
                                ? (hourData.sales_amount / hourData.quantity_sold).toFixed(2) 
                                : '0.00'
                            }
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={selectedItemId ? 4 : 5} align="center">
                        No hourly sales data available for the selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default HourlyItemSales; 
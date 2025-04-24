import React, { useState, useEffect } from 'react';
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Pagination,
  InputAdornment,
  Stack,
  Breadcrumbs,
  Link,
  useTheme,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import useApi from '../hooks/useApi';
import { dbApi, TransactionItem, ApiResponse } from '../services/api';
import StoreSelector from '../components/common/StoreSelector';
import { useStoreContext } from '../contexts/StoreContext';
import DatePicker from '../components/common/DatePicker';
import { getDefaultDateRange, getLast30DaysRange, formatDateTimeForDisplay } from '../utils/dateUtils';

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  let color;
  switch (status.toLowerCase()) {
    case 'completed':
      color = theme.palette.success.main;
      break;
    case 'pending':
      color = theme.palette.warning.main;
      break;
    case 'canceled':
    case 'void':
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

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: string;
  date: Date;
  dateFormatted: string;
  storeId: number;
  storeName: string;
}

const ITEMS_PER_PAGE = 100;

const Transactions: React.FC = () => {
  const theme = useTheme();
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  
  // Get store context for filtering
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();
  
  // Fetch transaction items from API with proper type
  const { data: apiResponse, isLoading, error } = useApi<ApiResponse<TransactionItem>>(
    () => dbApi.getTransactionItems(startDate, endDate, selectedStoreId),
    { deps: [startDate, endDate, selectedStoreId] }
  );

  // Process transaction items into orders
  const orders = React.useMemo(() => {
    if (!apiResponse?.data || apiResponse.data.length === 0) {
      console.log('No transaction items found');
      return [];
    }

    const transactionItems = apiResponse.data;
    console.log(`Processing ${transactionItems.length} transaction items`);
    
    // Group transactions by check_number (order ID)
    const orderMap = new Map<string, Order>();
    
    transactionItems.forEach((item: TransactionItem) => {
      if (!item || !item.check_number) return; // Skip invalid items
      
      const orderId = item.check_number.toString();
      
      // Format date - using business_date
      const dateStr = item.business_date;
      const date = new Date(dateStr);
      
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          customer: `Guest ${orderId.slice(-4)}`,
          items: [],
          total: 0,
          status: Number(item.record_type) === 0 ? 'Completed' : 'Void',
          date: date,
          dateFormatted: formatDateTimeForDisplay(dateStr),
          storeId: item.store_id,
          storeName: item.store_name || `Store ${item.store_id}`
        });
      }
      
      const order = orderMap.get(orderId)!;
      
      // Add all items, including those with zero price
      const itemName = `Item #${item.item_id} (Cat: ${item.category_id})`;
      // Check if this exact item (with same item_id) already exists in the order
      const existingItemIndex = order.items.findIndex(i => i.startsWith(`Item #${item.item_id}`));
      if (existingItemIndex === -1) {
        // New item
        order.items.push(itemName);
        order.total += item.price * item.quantity;
      } else {
        // Item exists, update quantity in the name
        const currentQuantity = (order.items[existingItemIndex].match(/x(\d+)/) || [null, '1'])[1];
        const newQuantity = parseInt(currentQuantity) + item.quantity;
        order.items[existingItemIndex] = `${itemName} x${newQuantity}`;
        order.total += item.price * item.quantity;
      }
    });
    
    const processedOrders = Array.from(orderMap.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    console.log('Processed orders:', processedOrders);
    
    return processedOrders;
  }, [apiResponse]);
  
  // Apply filters
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        order => 
          order.id.toLowerCase().includes(lowerSearchTerm) ||
          order.customer.toLowerCase().includes(lowerSearchTerm) ||
          order.items.some(item => item.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  // Get current page items
  const currentPageOrders = React.useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, page]);

  // Update pagination calculation based on filtered orders
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Update the view all handler
  const handleViewAll = () => {
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
                Transactions
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View and manage all customer transactions
                {selectedStore && (
                  <> for <b>{selectedStore.store_name}</b></>
                )}
              </Typography>
            </Box>
            
            <StoreSelector 
              stores={stores}
              selectedStoreId={selectedStoreId}
              onChange={setSelectedStoreId}
              size="small"
              showCount={false}
            />
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
              <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Transactions
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>
      
      <Card sx={{ mb: 3 }}>
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
                  onClick={handleViewAll}
                  sx={{ whiteSpace: 'nowrap', height: '40px' }}
                >
                  Last 30 Days
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ flex: 2 }}>
              <TextField
                fullWidth
                label="Search transactions"
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
                placeholder="Search by ID, customer or item name..."
              />
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: 220 } }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusChange}
                  startAdornment={
                    <FilterAltIcon sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }} fontSize="small" />
                  }
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {/* Filter indicators */}
          <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {selectedStoreId !== null && (
              <Chip 
                label={`Store: ${selectedStore?.store_name || selectedStoreId}`} 
                color="primary" 
                variant="outlined" 
                size="small"
                onDelete={() => setSelectedStoreId(null)} 
              />
            )}
            {statusFilter !== 'all' && (
              <Chip 
                label={`Status: ${statusFilter}`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
                onDelete={() => setStatusFilter('all')}
              />
            )}
            {searchTerm && (
              <Chip 
                label={`Search: ${searchTerm}`} 
                color="info" 
                variant="outlined" 
                size="small" 
                onDelete={() => setSearchTerm('')}
              />
            )}
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ my: 5 }}>
              Error loading transactions. Please try again.
            </Typography>
          ) : filteredOrders.length === 0 ? (
            <Typography align="center" sx={{ my: 5 }}>
              No transactions found for the selected criteria.
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                      {selectedStoreId === null && (
                        <TableCell sx={{ fontWeight: 'bold' }}>Store</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPageOrders.map(order => (
                      <TableRow 
                        key={order.id}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: theme.palette.action.hover },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 200 }}>
                            {order.items.length > 0 
                              ? (order.items.length > 3 
                                ? `${order.items.slice(0, 3).join(', ')} +${order.items.length - 3} more` 
                                : order.items.join(', '))
                              : 'No items'
                            }
                          </Typography>
                        </TableCell>
                        {selectedStoreId === null && (
                          <TableCell>{order.storeName}</TableCell>
                        )}
                        <TableCell>{order.dateFormatted}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <StatusChip 
                            status={order.status}
                            label={order.status}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)} - {Math.min(page * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} records
                </Typography>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Transactions; 
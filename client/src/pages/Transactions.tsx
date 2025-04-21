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
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import useApi from '../hooks/useApi';
import { dbApi, TransactionItem } from '../services/api';

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
}

const ITEMS_PER_PAGE = 10;

const Transactions: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  // Fetch transaction items from API
  const { data: transactionItems, isLoading, error } = useApi(
    () => dbApi.getTransactionItems(),
    {}
  );
  
  // Process transaction items into orders
  const orders = React.useMemo(() => {
    if (!transactionItems || transactionItems.length === 0) return [];

    // Group transactions by check_number (order ID)
    const orderMap = new Map<string, Order>();
    
    transactionItems.forEach(item => {
      if (!item || !item.check_number) return; // Skip invalid items
      
      const orderId = item.check_number.toString();
      
      // Format date - using business_date instead of transaction_date
      const dateStr = item.business_date ? new Date(item.business_date).toISOString() : new Date().toISOString();
      const date = new Date(dateStr);
      
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          customer: `Guest ${orderId.slice(-4)}`,
          items: [],
          total: 0,
          status: 'Completed', // Default status
          date: date,
          dateFormatted: format(date, 'MMM dd, yyyy h:mm a')
        });
      }
      
      const order = orderMap.get(orderId)!;
      // Use item_id if menu_item_name is not available
      const itemName = item.menu_item_name || `Item #${item.item_id}`;
      order.items.push(itemName);
      
      // Use price if item_sell_price is not available
      const itemPrice = typeof item.item_sell_price === 'number' ? item.item_sell_price : 
                        typeof item.price === 'number' ? item.price : 0;
      
      order.total += itemPrice;
    });
    
    // Convert map to array and sort by date (most recent first)
    return Array.from(orderMap.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactionItems]);
  
  // Apply filters
  useEffect(() => {
    let result = orders;
    
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
    setPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter]);
  
  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
              </Typography>
            </Box>
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Search by order ID, customer, or item..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                  <MenuItem value="void">Void</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Error loading transaction data: {error.message}
        </Typography>
      ) : filteredOrders.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No transactions found
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell component="th" scope="row">
                      #{order.id}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      {order.items.length > 2
                        ? `${order.items[0]}, ${order.items[1]} +${order.items.length - 2} more`
                        : order.items.join(', ')}
                    </TableCell>
                    <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={order.status}
                        status={order.status}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.dateFormatted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Transactions; 
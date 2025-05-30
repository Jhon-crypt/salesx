import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useApi from '../../hooks/useApi';
import { dbApi, TransactionItem } from '../../services/api';
import { format } from 'date-fns';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

interface RecentOrdersProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  preloadedData?: TransactionItem[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

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

// Define interface for order type
interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: string;
  date: Date;
  dateFormatted: string;
}

// Process transaction items into order-like format
const processTransactions = (transactions: TransactionItem[]): Order[] => {
  if (!transactions || transactions.length === 0) return [];

  // Group transactions by check_number (order ID)
  const orderMap = new Map<string, Order>();
  
  transactions.forEach(item => {
    if (!item || !item.check_number) return; // Skip invalid items
    
    const orderId = item.check_number.toString();
    
    // Format date - using business_date
    const dateStr = item.business_date ? new Date(item.business_date).toISOString() : new Date().toISOString();
    const date = new Date(dateStr);
    
    if (!orderMap.has(orderId)) {
      orderMap.set(orderId, {
        id: orderId,
        customer: `Guest ${orderId.slice(-4)}`,
        items: [],
        total: 0,
        status: item.record_type === 0 ? 'Completed' : 'Void',
        date: date,
        dateFormatted: format(date, 'MMM dd, yyyy h:mm a')
      });
    }
    
    const order = orderMap.get(orderId)!;
    // Use item_id since there's no item_name in the interface
    const itemName = `Item #${item.item_id}`;
    order.items.push(itemName);
    
    // Use price and quantity from the transaction item
    order.total += (item.price || 0) * (item.quantity || 1);
  });
  
  // Convert map to array and sort by date (most recent first)
  return Array.from(orderMap.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5); // Only keep the 5 most recent orders
};

const RecentOrders: React.FC<RecentOrdersProps> = ({
  title,
  subtitle,
  onViewAll,
  preloadedData
}) => {
  // Fetch transaction items from API only if not provided via props
  const { data: fetchedTransactionItems, isLoading, error } = useApi(
    () => dbApi.getTransactionItems(),
    { skipFetch: !!preloadedData }
  );
  
  // Use preloaded data if available, otherwise use fetched data
  const transactionItems = preloadedData || fetchedTransactionItems;
  
  // Process transaction items into orders
  const orders = React.useMemo(() => {
    // Handle API response structure
    const transactions = Array.isArray(transactionItems) 
      ? transactionItems 
      : transactionItems?.data || [];
    
    return processTransactions(transactions);
  }, [transactionItems]);

  return (
    <StyledCard>
      <CardContent sx={{ padding: 2, flexGrow: 1 }}>
        {title && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {onViewAll && (
              <Button
                endIcon={<ArrowRightAltIcon />}
                onClick={onViewAll}
                size="small"
              >
                View All
              </Button>
            )}
          </Box>
        )}
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            Error loading transaction data: {error.message}
          </Typography>
        ) : orders.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
            No recent orders found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
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
        )}
      </CardContent>
    </StyledCard>
  );
};

export default RecentOrders; 
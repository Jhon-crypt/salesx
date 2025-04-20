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
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
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

// Process transaction items into order-like format
const processTransactions = (transactions: any[]) => {
  if (!transactions || transactions.length === 0) return [];

  // Group transactions by check_number (order ID)
  const orderMap = new Map<string, any>();
  
  transactions.forEach(item => {
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
    
    const order = orderMap.get(orderId);
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
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5); // Only keep the 5 most recent orders
};

const RecentOrders: React.FC<RecentOrdersProps> = ({
  title,
  subtitle,
  onViewAll,
}) => {
  // Fetch transaction items from API
  const { data: transactionItems, isLoading, error } = useApi(() => dbApi.getTransactionItems());
  
  // Process transaction items into orders
  const orders = React.useMemo(() => {
    return processTransactions(transactionItems || []);
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
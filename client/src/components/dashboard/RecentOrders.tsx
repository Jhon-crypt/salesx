import React, { useState, useEffect } from 'react';
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
  Avatar,
  Button,
  useTheme,
  CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import apiService from '../../services/apiService';
import { RecentOrderData, transformRecentOrders } from '../../utils/dataTransformers';

// Type declaration for Order
type Order = RecentOrderData;

interface RecentOrdersProps {
  title: string;
  subtitle?: string;
  orders?: Order[]; // Make optional to allow both static and fetched data
  onViewAll?: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '400px', // Add minimum height to prevent layout shifts
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const RecentOrders: React.FC<RecentOrdersProps> = ({
  title,
  subtitle,
  orders: propOrders,
  onViewAll,
}) => {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If orders are provided via props, use those (for backward compatibility)
    if (propOrders && propOrders.length > 0) {
      setOrders(propOrders);
      return;
    }

    // Otherwise fetch from API
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const transactionItems = await apiService.getTransactionItems();
        if (transactionItems && transactionItems.length > 0) {
          const transformedOrders = transformRecentOrders(transactionItems);
          setOrders(transformedOrders);
        } else {
          setError('No order data available');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Could not load order data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [propOrders]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ 
        padding: theme.spacing(2), 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%' 
      }}>
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
            {error && (
              <Typography variant="caption" color="error">
                {error}
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

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 4,
            minHeight: '200px', // Ensure consistent height during loading
            alignItems: 'center' 
          }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : orders.length > 0 ? (
          <TableContainer sx={{ flexGrow: 1, width: '100%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Order ID</StyledTableHeadCell>
                  <StyledTableHeadCell>Customer</StyledTableHeadCell>
                  {orders.some(order => order.tableNumber !== undefined) && (
                    <StyledTableHeadCell>Table</StyledTableHeadCell>
                  )}
                  <StyledTableHeadCell>Items</StyledTableHeadCell>
                  <StyledTableHeadCell>Total</StyledTableHeadCell>
                  <StyledTableHeadCell>Status</StyledTableHeadCell>
                  <StyledTableHeadCell>Date</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <StyledTableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{order.id}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={order.customer.avatar}
                          sx={{ width: 28, height: 28, marginRight: 1 }}
                        >
                          {order.customer.initial}
                        </Avatar>
                        <Typography variant="body2">
                          {order.customer.name}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    {orders.some(order => order.tableNumber !== undefined) && (
                      <StyledTableCell>
                        {order.tableNumber ? (
                          <Typography variant="body2">
                            Table {order.tableNumber}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </StyledTableCell>
                    )}
                    <StyledTableCell>
                      <Typography variant="body2">
                        {order.items}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${order.total.toFixed(2)}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 500, minWidth: 90 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" color="text.secondary">
                        {order.date}
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 4,
            minHeight: '200px', // Ensure consistent height when empty
            alignItems: 'center' 
          }}>
            <Typography color="text.secondary">No orders found</Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default RecentOrders; 
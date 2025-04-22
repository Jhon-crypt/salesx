import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TransactionItem } from '../../services/api';
import { format } from 'date-fns';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface RecentOrdersProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  preloadedData?: TransactionItem[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ 
  title, 
  subtitle,
  onViewAll,
  preloadedData 
}) => {
  const theme = useTheme();
  const [data, setData] = useState<TransactionItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use preloaded data if available
  useEffect(() => {
    if (preloadedData) {
      setData(preloadedData);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }
  }, [preloadedData]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force refresh the data
    window.location.reload();
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%', 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
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
            color="primary" 
            onClick={onViewAll}
            sx={{ alignSelf: 'flex-start' }}
          >
            View All
          </Button>
        )}
      </Box>
      
      {loading && !data && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <CircularProgress size={40} />
        </Box>
      )}
      
      {error && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 300,
          color: 'error.main'
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Error loading transaction data: Network Error
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      )}
      
      {data && data.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Item</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, 5).map((order, index) => (
                <TableRow key={index} hover>
                  <TableCell>#{order.check_number}</TableCell>
                  <TableCell>{order.menu_item_name || `Item ${order.item_id}`}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(order.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {data && data.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary">
            No recent orders available for the selected period
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecentOrders; 
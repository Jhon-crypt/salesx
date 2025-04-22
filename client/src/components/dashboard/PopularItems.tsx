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
import { ItemSalesData } from '../../services/api';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PopularItemsProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  preloadedData?: ItemSalesData[];
}

const PopularItems: React.FC<PopularItemsProps> = ({ 
  title, 
  subtitle,
  onViewAll,
  preloadedData 
}) => {
  const theme = useTheme();
  const [data, setData] = useState<ItemSalesData[] | null>(null);
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
            Error loading popular items data: Network Error
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
                <TableCell>Item</TableCell>
                <TableCell align="right">Qty Sold</TableCell>
                <TableCell align="right">Sales</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .sort((a, b) => b.quantity_sold - a.quantity_sold)
                .slice(0, 5)
                .map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell align="right">{item.quantity_sold}</TableCell>
                    <TableCell align="right">{formatCurrency(item.sales_amount)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {data && data.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <Typography variant="body1" color="text.secondary">
            No popular items data available for the selected period
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PopularItems; 
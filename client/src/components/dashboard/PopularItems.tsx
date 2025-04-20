import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  useTheme,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import useApi from '../../hooks/useApi';
import { dbApi, ItemSalesData } from '../../services/api';

interface PopularItemsProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.background.default,
  width: '100%',
  marginTop: theme.spacing(1),
}));

// Process items to calculate popularity
const processItems = (items: ItemSalesData[]) => {
  if (!items || items.length === 0) return [];

  // Group by item name
  const itemMap = new Map<string, any>();
  
  items.forEach(item => {
    const itemName = item.item_name;
    const itemNumber = item.item_number.toString();
    
    if (!itemMap.has(itemNumber)) {
      itemMap.set(itemNumber, {
        id: itemNumber,
        name: itemName,
        category: 'Menu Item', // Default category
        sales: 0,
        quantity: 0,
        price: 0,
        popularity: 0
      });
    }
    
    const menuItem = itemMap.get(itemNumber);
    menuItem.sales += item.sales_amount || 0;
    menuItem.quantity += item.quantity_sold || 0;
  });
  
  // Convert to array and sort by quantity
  const processedItems = Array.from(itemMap.values());
  
  // Find max quantity to calculate popularity percentage
  const maxQuantity = Math.max(...processedItems.map(item => item.quantity));
  
  // Calculate popularity and format data
  processedItems.forEach(item => {
    item.popularity = maxQuantity > 0 ? Math.round((item.quantity / maxQuantity) * 100) : 0;
    item.price = item.sales / item.quantity || 0;
  });
  
  // Sort by popularity and take top 5
  return processedItems
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

const PopularItems: React.FC<PopularItemsProps> = ({
  title,
  subtitle,
  onViewAll,
}) => {
  const theme = useTheme();
  
  // Fetch item sales data from API
  const { data: itemSalesData, isLoading, error } = useApi(() => dbApi.getItemSales());
  
  // Process items
  const items = React.useMemo(() => {
    return processItems(itemSalesData || []);
  }, [itemSalesData]);

  const getLinearProgressColor = (popularity: number) => {
    if (popularity >= 75) return 'success';
    if (popularity >= 50) return 'secondary';
    if (popularity >= 25) return 'warning';
    return 'error';
  };

  return (
    <StyledCard>
      <CardContent sx={{ padding: theme.spacing(2), flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            Error loading popular items data: {error.message}
          </Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
            No popular items found
          </Typography>
        ) : (
          <List disablePadding sx={{ flexGrow: 1 }}>
            {items.map((item) => (
              <StyledListItem key={item.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.default
                    }}
                  >
                    <RestaurantIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {item.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity} sold
                        </Typography>
                      </Box>
                      <StyledLinearProgress 
                        variant="determinate" 
                        value={item.popularity} 
                        color={getLinearProgressColor(item.popularity)}
                      />
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </StyledListItem>
            ))}
          </List>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default PopularItems; 
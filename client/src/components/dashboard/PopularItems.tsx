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
  preloadedData?: ItemSalesData[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
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
  if (!items || items.length === 0) {
    console.log("No item sales data available");
    return [];
  }

  console.log("Processing items:", items.length);
  
  // Group by item name
  const itemMap = new Map<string, {
    id: string;
    name: string;
    category: string;
    sales: number;
    quantity: number;
    price: number;
    popularity: number;
  }>();
  
  items.forEach(item => {
    if (!item || !item.item_name) return;
    
    const itemName = item.item_name;
    const itemNumber = item.item_number?.toString() || `item-${itemName.replace(/\s+/g, '-')}`;
    
    if (!itemMap.has(itemNumber)) {
      itemMap.set(itemNumber, {
        id: itemNumber,
        name: itemName || `Item #${item.item_number}`,
        category: 'Menu Item', // Default category since category_name is not available
        sales: 0,
        quantity: 0,
        price: 0,
        popularity: 0
      });
    }
    
    const menuItem = itemMap.get(itemNumber)!;
    menuItem.sales += item.sales_amount || 0;
    menuItem.quantity += item.quantity_sold || 0;
  });
  
  // Convert to array and sort by quantity
  const processedItems = Array.from(itemMap.values());
  
  if (processedItems.length === 0) {
    console.log("No processed items after mapping");
    return [];
  }
  
  // Use a default price value for items with zero sales amount
  const DEFAULT_PRICE = 3.99;
  
  // Find max quantity to calculate popularity percentage
  const maxQuantity = Math.max(...processedItems.map(item => item.quantity));
  
  // Calculate popularity and format data
  processedItems.forEach(item => {
    item.popularity = maxQuantity > 0 ? Math.round((item.quantity / maxQuantity) * 100) : 0;
    
    // Avoid division by zero and handle zero sales amount
    if (item.quantity > 0) {
      // If sales amount is 0 but we have quantity, use default price
      if (item.sales === 0) {
        item.price = DEFAULT_PRICE;
      } else {
        item.price = item.sales / item.quantity;
      }
    } else {
      item.price = DEFAULT_PRICE;
    }
  });
  
  console.log("Processed items:", processedItems.map(i => `${i.name}: qty=${i.quantity}, price=${i.price}`));
  
  // Sort by popularity (quantity) and take top 5
  return processedItems
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

const PopularItems: React.FC<PopularItemsProps> = ({
  title,
  subtitle,
  onViewAll,
  preloadedData
}) => {
  const theme = useTheme();
  
  console.log("PopularItems rendering with preloaded data:", preloadedData?.length || 'None');
  
  // Fetch item sales data from API only if not provided via props
  const { data: fetchedItemSalesData, isLoading, error } = useApi(
    () => dbApi.getItemSales(),
    { skipFetch: !!preloadedData }
  );
  
  // Use preloaded data if available, otherwise use fetched data
  const itemSalesData = preloadedData || fetchedItemSalesData;
  
  console.log("ItemSalesData available:", itemSalesData?.length || 'None');
  
  // Process items
  const items = React.useMemo(() => {
    const processed = processItems(itemSalesData || []);
    console.log("Processed popular items:", processed.length);
    return processed;
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
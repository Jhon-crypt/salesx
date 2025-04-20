import React, { useState, useEffect } from 'react';
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
import apiService from '../../services/apiService';
import { PopularItemData, transformPopularItems } from '../../utils/dataTransformers';

// We can use PopularItemData directly instead of creating a new interface
type MenuItem = PopularItemData;

interface PopularItemsProps {
  title: string;
  subtitle?: string;
  items?: MenuItem[]; // Make optional to support both prop-based and API-fetched data
  onViewAll?: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '400px', // Add minimum height to prevent layout shifts
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

const PopularItems: React.FC<PopularItemsProps> = ({
  title,
  subtitle,
  items: propItems,
  onViewAll,
}) => {
  const theme = useTheme();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If items are provided via props, use those
    if (propItems && propItems.length > 0) {
      setItems(propItems);
      return;
    }

    // Otherwise fetch from API
    const fetchPopularItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemSalesData = await apiService.getItemSales();
        if (itemSalesData && itemSalesData.length > 0) {
          const popularItems = transformPopularItems(itemSalesData);
          setItems(popularItems);
        } else {
          setError('No popular items data available');
        }
      } catch (err) {
        console.error('Error fetching popular items:', err);
        setError('Could not load popular items data');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, [propItems]);

  const getLinearProgressColor = (popularity: number) => {
    if (popularity >= 75) return 'success';
    if (popularity >= 50) return 'secondary';
    if (popularity >= 25) return 'warning';
    return 'error';
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
            minHeight: '300px', // Ensure consistent height during loading
            alignItems: 'center',
            width: '100%'
          }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : items.length > 0 ? (
          <List disablePadding sx={{ flexGrow: 1, width: '100%' }}>
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
                          {item.sales} sold
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
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 4,
            minHeight: '300px', // Ensure consistent height when empty
            alignItems: 'center',
            width: '100%'
          }}>
            <Typography color="text.secondary">No popular items found</Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default PopularItems; 
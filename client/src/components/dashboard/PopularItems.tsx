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
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface MenuItem {
  id: string;
  name: string;
  image?: string;
  category: string;
  popularity: number; // 0-100
  sales: number;
  price: number;
}

interface PopularItemsProps {
  title: string;
  subtitle?: string;
  items: MenuItem[];
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

const PopularItems: React.FC<PopularItemsProps> = ({
  title,
  subtitle,
  items,
  onViewAll,
}) => {
  const theme = useTheme();

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

        <List disablePadding sx={{ flexGrow: 1 }}>
          {items.map((item) => (
            <StyledListItem key={item.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar
                  src={item.image}
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
      </CardContent>
    </StyledCard>
  );
};

export default PopularItems; 
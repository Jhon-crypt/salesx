import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Box,
  Chip,
  Typography,
  useTheme
} from '@mui/material';
import { dbApi, StoreInfo } from '../../services/api';
import useApi from '../../hooks/useApi';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface StoreSelectorProps {
  value: number | null;
  onChange: (storeId: number | null) => void;
  label?: string;
  width?: string | number;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  showStoreCount?: boolean;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
  value,
  onChange,
  label = 'Store',
  width = 200,
  variant = 'outlined',
  size = 'small',
  showStoreCount = true
}) => {
  const theme = useTheme();
  const { data: stores, isLoading } = useApi(() => dbApi.getStores());
  
  // Handle select change
  const handleChange = (event: SelectChangeEvent<string>) => {
    const storeId = event.target.value === 'all' ? null : parseInt(event.target.value);
    onChange(storeId);
  };

  // Format store display name with sales data if available
  const formatStoreName = (store: StoreInfo) => {
    if (!store.daily_sales) return store.store_name;
    return `${store.store_name} ($${store.daily_sales.toLocaleString()})`;
  };

  return (
    <FormControl variant={variant} sx={{ minWidth: width }} size={size}>
      <InputLabel id="store-selector-label">{label}</InputLabel>
      <Select
        labelId="store-selector-label"
        value={value === null ? 'all' : value.toString()}
        onChange={handleChange}
        label={label}
        disabled={isLoading}
        startAdornment={
          <StorefrontIcon 
            sx={{ 
              color: 'action.active', 
              mr: 1,
              ml: -0.5
            }} 
            fontSize="small"
          />
        }
      >
        <MenuItem value="all">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography>All Stores</Typography>
            {showStoreCount && stores && (
              <Chip 
                label={`${stores.length} stores`} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  backgroundColor: theme.palette.primary.main + '20',
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }} 
              />
            )}
          </Box>
        </MenuItem>
        
        {stores?.map((store) => (
          <MenuItem key={store.store_id} value={store.store_id.toString()}>
            {formatStoreName(store)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StoreSelector; 
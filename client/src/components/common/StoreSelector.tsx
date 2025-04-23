import React, { useCallback, useMemo } from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box, Chip } from '@mui/material';
import { StoreInfo } from '../../services/api';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';

interface StoreSelectorProps {
  stores: StoreInfo[];
  selectedStoreId: number | null;
  onChange: (storeId: number | null) => void;
  size?: 'small' | 'medium';
  label?: string;
  fullWidth?: boolean;
  maxWidth?: number | string;
  showCount?: boolean;
  disabled?: boolean;
}

/**
 * A high-performance store selector component that allows users to filter dashboard data
 * by individual stores or view data from all stores combined.
 */
const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStoreId,
  onChange,
  size = 'medium',
  label = 'Select Store',
  fullWidth = false,
  maxWidth = 250,
  showCount = true,
  disabled = false
}) => {
  // Memoized sorted stores with "All Stores" option at the top
  const sortedStores = useMemo(() => {
    // Deep clone and sort stores by name
    return [...stores].sort((a, b) => a.store_name.localeCompare(b.store_name));
  }, [stores]);

  // Handle store selection change
  const handleChange = useCallback((event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    const storeId = value === 'all' ? null : Number(value);
    onChange(storeId);
  }, [onChange]);

  // Format store name for display with optional sales data
  const formatStoreName = useCallback((store: StoreInfo) => {
    let name = store.store_name;
    if (showCount && store.daily_sales !== undefined) {
      name += ` ($${store.daily_sales.toLocaleString()})`;
    }
    return name;
  }, [showCount]);

  // Selected value for the select component
  const selectValue = useMemo(() => selectedStoreId === null ? 'all' : selectedStoreId, [selectedStoreId]);

  return (
    <FormControl
      size={size}
      fullWidth={fullWidth}
      sx={{ maxWidth, minWidth: 150 }}
      disabled={disabled}
    >
      <InputLabel id="store-selector-label">{label}</InputLabel>
      <Select
        labelId="store-selector-label"
        id="store-selector"
        value={selectValue}
        label={label}
        onChange={handleChange}
        startAdornment={
          <StorefrontIcon sx={{ mr: 1, ml: -0.5, color: 'text.secondary' }} fontSize="small" />
        }
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 400 }
          }
        }}
      >
        <MenuItem value="all" divider sx={{ fontWeight: selectedStoreId === null ? 'bold' : 'normal' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="small" color="primary" />
            All Stores
            {showCount && stores.length > 0 && (
              <Chip 
                label={stores.length} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1 } }} 
              />
            )}
          </Box>
        </MenuItem>
        
        {sortedStores.map((store) => (
          <MenuItem 
            key={store.store_id} 
            value={store.store_id}
            sx={{ fontWeight: selectedStoreId === store.store_id ? 'bold' : 'normal' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorefrontIcon fontSize="small" color="action" />
              {formatStoreName(store)}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default React.memo(StoreSelector); 
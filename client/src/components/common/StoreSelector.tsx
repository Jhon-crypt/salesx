import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box } from '@mui/material';
import { dbApi, StoreInfo } from '../../services/api';
import useApi from '../../hooks/useApi';

export interface StoreSelectorProps {
  value: number | null;
  onChange: (storeId: number | null) => void;
  label?: string;
  sx?: Record<string, unknown>;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ 
  value, 
  onChange, 
  label = "Select Store", 
  sx 
}) => {
  // Fetch stores data
  const { data: storesData, isLoading, error } = useApi(
    () => dbApi.getStores(),
    { deps: [] }
  );

  // Convert raw value to string for Select component
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    // Convert "null" string to actual null, or string to number
    onChange(selectedValue === "null" ? null : Number(selectedValue));
  };

  return (
    <Box sx={sx}>
      <FormControl fullWidth size="small">
        <InputLabel id="store-selector-label">{label}</InputLabel>
        <Select
          labelId="store-selector-label"
          id="store-selector"
          value={value === null ? "null" : String(value)}
          label={label}
          onChange={handleChange}
          disabled={isLoading || !!error}
        >
          <MenuItem value="null">All Stores</MenuItem>
          {storesData?.map((store: StoreInfo) => (
            <MenuItem key={store.store_id} value={String(store.store_id)}>
              {store.store_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default StoreSelector; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Pagination,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack,
  Breadcrumbs,
  Link,
  useTheme,
  Grid,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import useApi from '../hooks/useApi';
import { dbApi, StoreInfo } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import { useStore } from '../contexts/StoreContext';

const ITEMS_PER_PAGE = 10;

const StoreInfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const Stores: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filteredStores, setFilteredStores] = useState<StoreInfo[]>([]);
  
  // Use the global store context
  const { selectedStoreId, setSelectedStoreId, stores: contextStores, isLoading: contextLoading } = useStore();
  
  // Fetch store data from API
  const { data: apiStores, isLoading: apiLoading } = useApi(
    () => dbApi.getStores(),
    { skip: contextStores?.length > 0 }
  );
  
  // Use stores from context if available, otherwise from API
  const stores = contextStores?.length > 0 ? contextStores : apiStores || [];
  const isLoading = contextLoading || apiLoading;
  
  // Apply search filter
  useEffect(() => {
    if (!stores) {
      setFilteredStores([]);
      return;
    }
    
    let result = stores;
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        store => 
          store.store_name.toLowerCase().includes(lowerSearchTerm) ||
          store.store_id.toString().includes(lowerSearchTerm)
      );
    }
    
    setFilteredStores(result);
    setPage(1); // Reset to first page when filters change
  }, [stores, searchTerm]);
  
  // Pagination
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const paginatedStores = filteredStores.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Calculate summary stats for displayed stores
  const totalSales = filteredStores.reduce((sum, store) => sum + (store.daily_sales || 0), 0);
  const totalTransactions = filteredStores.reduce((sum, store) => sum + (store.check_count || 0), 0);
  const totalCustomers = filteredStores.reduce((sum, store) => sum + (store.guest_count || 0), 0);

  // Handle store selection
  const handleSelectStore = (storeId: number) => {
    // If clicking the already selected store, deselect it (select all stores)
    if (selectedStoreId === storeId) {
      setSelectedStoreId(null);
    } else {
      setSelectedStoreId(storeId);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Stores"
        subtitle="View and manage all your store locations"
        showDatePicker={false}
        breadcrumbs={[
          { label: 'Stores' }
        ]}
      />
      
      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}>
            <Typography>Loading stores...</Typography>
          </Grid>
        ) : stores?.length > 0 ? (
          <>
            {/* All Stores Card */}
            <Grid item xs={12} md={4} lg={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedStoreId === null ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  boxShadow: selectedStoreId === null ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onClick={() => setSelectedStoreId(null)}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        bgcolor: '#f0f0f0', 
                        p: 1, 
                        borderRadius: 1, 
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <StorefrontIcon color="action" />
                      </Box>
                      <Typography variant="h6">All Stores</Typography>
                    </Box>
                    
                    <Chip 
                      label={`${stores.length} locations`} 
                      size="small" 
                      sx={{ mb: 2 }} 
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      View combined data from all store locations
                    </Typography>
                  </Box>
                  
                  <Button 
                    variant={selectedStoreId === null ? "contained" : "outlined"} 
                    size="small" 
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                  >
                    {selectedStoreId === null ? "Currently Selected" : "Select All Stores"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Individual Store Cards */}
            {stores.map(store => (
              <Grid item xs={12} md={4} lg={3} key={store.store_id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedStoreId === store.store_id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    boxShadow: selectedStoreId === store.store_id ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onClick={() => handleSelectStore(store.store_id)}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          bgcolor: '#f0f8ff', 
                          p: 1, 
                          borderRadius: 1, 
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <StorefrontIcon color="primary" />
                        </Box>
                        <Typography variant="h6">{store.store_name}</Typography>
                      </Box>
                      
                      {store.daily_sales && (
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          ${store.daily_sales.toLocaleString()}
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Daily Sales
                          </Typography>
                        </Typography>
                      )}
                      
                      {store.guest_count && (
                        <Typography variant="body2" color="text.secondary">
                          {store.guest_count} customers
                        </Typography>
                      )}
                    </Box>
                    
                    <Button 
                      variant={selectedStoreId === store.store_id ? "contained" : "outlined"} 
                      size="small" 
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                    >
                      {selectedStoreId === store.store_id ? "Currently Selected" : "Select Store"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </>
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No stores found</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Stores; 
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
  useTheme
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
  
  // Fetch store data from API
  const { data: storeData, isLoading, error } = useApi(
    () => dbApi.getStores(),
    {}
  );
  
  // Apply search filter
  useEffect(() => {
    if (!storeData) {
      setFilteredStores([]);
      return;
    }
    
    let result = storeData;
    
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
  }, [storeData, searchTerm]);
  
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Page Header */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}11 0%, ${theme.palette.secondary.main}11 100%)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                Store Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View and analyze performance across all store locations
              </Typography>
            </Box>
          </Box>
          
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <StorefrontIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Stores
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>
      
      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', flex: '1 1 30%', minWidth: '250px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <StorefrontIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Total Stores
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {filteredStores.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', flex: '1 1 30%', minWidth: '250px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Total Sales
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText', flex: '1 1 30%', minWidth: '250px' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Total Customers
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalCustomers.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by store name or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      {/* Store Data Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Error loading store data: {error.message}
        </Typography>
      ) : filteredStores.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No stores found
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Store ID</TableCell>
                  <TableCell>Store Name</TableCell>
                  <TableCell align="right">Daily Sales</TableCell>
                  <TableCell align="right">Transactions</TableCell>
                  <TableCell align="right">Customers</TableCell>
                  <TableCell align="right">Avg. Transaction</TableCell>
                  <TableCell align="right">Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStores.map((store) => {
                  // Calculate metrics
                  const avgTransaction = store.check_count && store.check_count > 0
                    ? (store.daily_sales || 0) / store.check_count
                    : 0;
                  
                  return (
                    <TableRow key={store.store_id} hover>
                      <TableCell>#{store.store_id}</TableCell>
                      <TableCell>{store.store_name}</TableCell>
                      <TableCell align="right">
                        ${store.daily_sales?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </TableCell>
                      <TableCell align="right">
                        {store.check_count?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell align="right">
                        {store.guest_count?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell align="right">
                        ${avgTransaction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {store.transaction_date 
                          ? new Date(store.transaction_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Stores; 
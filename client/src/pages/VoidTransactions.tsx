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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Pagination,
  InputAdornment,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parseISO, subDays } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import useApi from '../hooks/useApi';
import { dbApi } from '../services/api';
import { useStoreContext } from '../contexts/StoreContext';
import StoreSelector from '../components/common/StoreSelector';
import DatePicker from '../components/common/DatePicker';

interface VoidTransactionDisplay {
  id: string;
  itemId: number;
  price: number;
  date: Date;
  dateFormatted: string;
  timeFormatted: string;
  employee: string;
  manager: string;
  store: string;
  reason: string;
}

const ITEMS_PER_PAGE = 10;

// Mapping of void reason IDs to human-readable reasons
const VOID_REASONS: Record<number, string> = {
  1: 'Customer Complaint',
  2: 'Order Error',
  3: 'Employee Meal',
  4: 'Manager Comp',
  5: 'Product Quality',
  6: 'Wrong Order',
  7: 'System Error',
  8: 'Duplicate Order',
  9: 'Test Transaction',
  10: 'Other',
};

const ReasonChip = styled(Chip)(() => ({
  fontWeight: 'bold',
  fontSize: '0.75rem',
}));

const VoidTransactions: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [filteredTransactions, setFilteredTransactions] = useState<VoidTransactionDisplay[]>([]);
  
  // Add state for date filtering
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);
  
  // Get store context for filtering
  const { stores, selectedStoreId, selectedStore, setSelectedStoreId } = useStoreContext();
  
  // Fetch transaction items from API with date range
  const { data: voidTransactions, isLoading, error } = useApi(
    () => dbApi.getVoidTransactions(startDate, endDate, selectedStoreId),
    { deps: [startDate, endDate, selectedStoreId] }
  );
  
  // Process void transactions into more display-friendly format
  const processedTransactions = React.useMemo(() => {
    if (!voidTransactions || voidTransactions.length === 0) return [];

    return voidTransactions.map(transaction => {
      // Format date and time
      const date = new Date(transaction.business_date);
      const hours = transaction.transaction_hour || 0;
      const minutes = transaction.transaction_minute || 0;
      
      // Add hours and minutes to date
      date.setHours(hours, minutes);
      
      // Create a display-friendly record
      return {
        id: `${transaction.check_id}`,
        itemId: transaction.item_id,
        price: transaction.price,
        date,
        dateFormatted: format(date, 'MMM dd, yyyy'),
        timeFormatted: format(date, 'h:mm a'),
        employee: `Emp #${transaction.employee_id}`,
        manager: `Mgr #${transaction.manager_id}`,
        store: `Store #${transaction.store_id}`,
        reason: VOID_REASONS[transaction.void_reason_id] || `Reason #${transaction.void_reason_id}`
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [voidTransactions]);
  
  // Apply filters
  useEffect(() => {
    let result = processedTransactions;
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        transaction => 
          transaction.id.toLowerCase().includes(lowerSearchTerm) ||
          transaction.employee.toLowerCase().includes(lowerSearchTerm) ||
          transaction.manager.toLowerCase().includes(lowerSearchTerm) ||
          transaction.store.toLowerCase().includes(lowerSearchTerm) ||
          transaction.reason.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply reason filter
    if (reasonFilter !== 'all') {
      result = result.filter(transaction => 
        transaction.reason.toLowerCase() === reasonFilter.toLowerCase()
      );
    }
    
    setFilteredTransactions(result);
    setPage(1); // Reset to first page when filters change
  }, [processedTransactions, searchTerm, reasonFilter]);
  
  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  const handleReasonChange = (event: SelectChangeEvent) => {
    setReasonFilter(event.target.value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Calculate totals for the filtered transactions
  const totalVoided = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.price, 
    0
  );
  
  // Handle date changes
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };
  
  // Add a function to view the last 30 days of data
  const handleViewLast30Days = () => {
    const today = new Date();
    const last30Days = format(subDays(today, 30), 'yyyy-MM-dd');
    const todayFormatted = format(today, 'yyyy-MM-dd');
    
    console.log('Setting date range to last 30 days:', { 
      from: last30Days, 
      to: todayFormatted 
    });
    
    setStartDate(last30Days);
    setEndDate(todayFormatted);
  };

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
                Void Transactions
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Monitor and analyze voided sales
                {selectedStore && (
                  <> for <b>{selectedStore.store_name}</b></>
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StoreSelector 
                stores={stores}
                selectedStoreId={selectedStoreId}
                onChange={setSelectedStoreId}
                size="small"
                showCount={false}
              />
              <Card sx={{ p: 2, display: 'inline-flex', alignItems: 'center' }}>
                <CancelIcon sx={{ color: 'error.main', mr: 1, fontSize: 30 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Voided
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${totalVoided.toFixed(2)}
                  </Typography>
                </Box>
              </Card>
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
            <Link
              underline="hover"
              color="inherit"
              href="/sales/transactions"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Transactions
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <CancelIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Void Transactions
            </Typography>
          </Breadcrumbs>
        </Stack>
      </Paper>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: { xs: 2, md: 0 } }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  sx={{ width: '100%' }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  sx={{ width: '100%' }}
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleViewLast30Days}
                  sx={{ whiteSpace: 'nowrap', height: '40px' }}
                >
                  Last 30 Days
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search by ID, employee, manager, store..."
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
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="reason-filter-label">Void Reason</InputLabel>
                <Select
                  labelId="reason-filter-label"
                  id="reason-filter"
                  value={reasonFilter}
                  label="Void Reason"
                  onChange={handleReasonChange}
                >
                  <MenuItem value="all">All Reasons</MenuItem>
                  {Object.values(VOID_REASONS).map((reason) => (
                    <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Error loading void transaction data: {error.message}
        </Typography>
      ) : filteredTransactions.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No void transactions found
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Item ID</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={`${transaction.id}-${transaction.itemId}`} hover>
                    <TableCell component="th" scope="row">
                      #{transaction.id}
                    </TableCell>
                    <TableCell>{transaction.itemId}</TableCell>
                    <TableCell align="right">${transaction.price.toFixed(2)}</TableCell>
                    <TableCell>{transaction.dateFormatted}</TableCell>
                    <TableCell>{transaction.timeFormatted}</TableCell>
                    <TableCell>{transaction.employee}</TableCell>
                    <TableCell>{transaction.manager}</TableCell>
                    <TableCell>{transaction.store}</TableCell>
                    <TableCell>
                      <ReasonChip
                        label={transaction.reason}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
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

export default VoidTransactions; 
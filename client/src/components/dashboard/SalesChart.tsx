import React, { useState, useMemo } from 'react';
import { Card, CardContent, Typography, Box, ButtonGroup, Button, useTheme, CircularProgress } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { styled } from '@mui/material/styles';
import useApi from '../../hooks/useApi';
import { dbApi, SalesData } from '../../services/api';
import { format, subDays, subMonths, parseISO } from 'date-fns';

// Define time range options
type TimeRange = 'day' | 'week' | 'month' | 'year';

interface SalesChartProps {
  title: string;
  subtitle?: string;
  preloadedData?: SalesData[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

// Helper to group sales data by different time ranges
const processDataByTimeRange = (data: SalesData[], range: TimeRange) => {
  if (!data || data.length === 0) return [];
  
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );
  
  // Define filtering function based on time range
  const filterByTimeRange = (item: SalesData) => {
    const date = parseISO(item.transaction_date);
    const now = new Date();
    
    switch (range) {
      case 'day':
        return date >= subDays(now, 1); // This will filter to just yesterday
      case 'week':
        return date >= subDays(now, 7);
      case 'month':
        return date >= subDays(now, 30);
      case 'year':
        return date >= subMonths(now, 12);
      default:
        return true;
    }
  };
  
  // Filter data by selected time range
  const filteredData = sortedData.filter(filterByTimeRange);
  
  // Group and aggregate data based on time range
  const groupedData = filteredData.reduce((acc, curr) => {
    const date = parseISO(curr.transaction_date);
    let key: string;
    
    switch (range) {
      case 'day':
        key = format(date, 'HH:00');
        break;
      case 'week':
        key = format(date, 'EEE');
        break;
      case 'month':
        key = format(date, 'dd');
        break;
      case 'year':
        key = format(date, 'MMM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    const existingItem = acc.find(item => item.name === key);
    
    if (existingItem) {
      existingItem.sales += curr.daily_sales;
      existingItem.orders += curr.check_count;
      existingItem.customers += curr.guest_count;
    } else {
      acc.push({
        name: key,
        sales: curr.daily_sales,
        orders: curr.check_count,
        customers: curr.guest_count
      });
    }
    
    return acc;
  }, [] as any[]);
  
  return groupedData;
};

const SalesChart: React.FC<SalesChartProps> = ({
  title,
  subtitle,
  preloadedData
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  
  // Fetch sales data from API only if not provided via props
  const { data: fetchedSalesData, isLoading, error } = useApi(
    () => dbApi.getStoreSales(),
    { skipFetch: !!preloadedData } // Skip API call if we have preloaded data
  );
  
  // Use preloaded data if available, otherwise use fetched data
  const salesData = preloadedData || fetchedSalesData;
  
  // Process data based on selected time range
  const chartData = useMemo(() => {
    if (!salesData) return [];
    return processDataByTimeRange(salesData, timeRange);
  }, [salesData, timeRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  return (
    <StyledCard>
      <CardContent sx={{ padding: theme.spacing(2), flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          <ButtonGroup size="small" aria-label="time range filter">
            <Button 
              variant={timeRange === 'day' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('day')}
            >
              Day
            </Button>
            <Button 
              variant={timeRange === 'week' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('year')}
            >
              Year
            </Button>
          </ButtonGroup>
        </Box>
        <Box sx={{ flexGrow: 1, width: '100%', height: 300, minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading ? (
            <CircularProgress />
          ) : error ? (
            <Typography color="error">
              Error loading sales data: {error.message}
            </Typography>
          ) : chartData.length === 0 ? (
            <Typography color="text.secondary">
              No sales data available for the selected time range
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary }} />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  tick={{ fill: theme.palette.text.secondary }} 
                  label={{ 
                    value: 'Sales ($)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: theme.palette.text.secondary }}
                  label={{ 
                    value: 'Count', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fill: theme.palette.text.secondary }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                    boxShadow: theme.shadows[3],
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Legend />
                <Bar 
                  yAxisId="right" 
                  dataKey="orders" 
                  barSize={20} 
                  fill={theme.palette.primary.main} 
                  name="Orders"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="sales" 
                  stroke={theme.palette.secondary.main} 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Sales ($)"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="customers" 
                  stroke={theme.palette.success.main}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  name="Customers"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default SalesChart; 
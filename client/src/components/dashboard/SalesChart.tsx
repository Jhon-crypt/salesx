import React, { useState, useEffect } from 'react';
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
  Area,
} from 'recharts';
import { styled } from '@mui/material/styles';
import apiService from '../../services/apiService';
import { transformSalesDataForChart, SalesChartData } from '../../utils/dataTransformers';

// Define time range options
type TimeRange = 'day' | 'week' | 'month' | 'year';

interface SalesChartProps {
  title: string;
  subtitle?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

// Helper function to generate random data - kept for fallback
const generateData = (range: TimeRange) => {
  const data = [];
  
  switch (range) {
    case 'day':
      for (let i = 0; i < 24; i++) {
        data.push({
          name: `${i}:00`,
          sales: Math.floor(Math.random() * 1000) + 500,
          orders: Math.floor(Math.random() * 50) + 10,
          customers: Math.floor(Math.random() * 40) + 5,
        });
      }
      break;
    case 'week':
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        data.push({
          name: days[i],
          sales: Math.floor(Math.random() * 10000) + 5000,
          orders: Math.floor(Math.random() * 200) + 50,
          customers: Math.floor(Math.random() * 150) + 30,
        });
      }
      break;
    case 'month':
      for (let i = 1; i <= 30; i++) {
        data.push({
          name: `${i}`,
          sales: Math.floor(Math.random() * 15000) + 8000,
          orders: Math.floor(Math.random() * 300) + 100,
          customers: Math.floor(Math.random() * 250) + 80,
        });
      }
      break;
    case 'year':
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        data.push({
          name: months[i],
          sales: Math.floor(Math.random() * 100000) + 50000,
          orders: Math.floor(Math.random() * 1000) + 500,
          customers: Math.floor(Math.random() * 800) + 300,
        });
      }
      break;
    default:
      break;
  }
  
  return data;
};

const SalesChart: React.FC<SalesChartProps> = ({
  title,
  subtitle,
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [data, setData] = useState<SalesChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const salesData = await apiService.getStoreSales();
        if (salesData && salesData.length > 0) {
          const transformedData = transformSalesDataForChart(salesData, timeRange);
          setData(transformedData);
        } else {
          // Fallback to generated data if API returns empty result
          setData(generateData(timeRange));
          setError('No sales data available, showing sample data instead');
        }
      } catch (err) {
        console.error('Error fetching sales data:', err);
        // Fallback to generated data on error
        setData(generateData(timeRange));
        setError('Could not load sales data, showing sample data instead');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

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
            {error && (
              <Typography variant="caption" color="error">
                {error}
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
          {loading ? (
            <CircularProgress color="secondary" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
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
                <Area 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="customers" 
                  fill={theme.palette.success.light} 
                  stroke={theme.palette.success.main}
                  fillOpacity={0.3}
                  name="Customers"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <Typography color="text.secondary">No data available</Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default SalesChart; 
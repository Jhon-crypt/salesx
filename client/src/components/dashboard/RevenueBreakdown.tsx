import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  useTheme,
  LinearProgress,
  CircularProgress,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import useApi from '../../hooks/useApi';
import { dbApi, CategorySales } from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface RevenueBreakdownProps {
  title: string;
  subtitle?: string;
  preloadedData?: CategorySales[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.background.default,
  width: '100%',
}));

// Format currency value to proper string
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  title,
  subtitle,
  preloadedData
}) => {
  const theme = useTheme();
  const [data, setData] = useState<CategorySales[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use preloaded data if available
  useEffect(() => {
    if (preloadedData) {
      setData(preloadedData);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }
  }, [preloadedData]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Force refresh the data
    window.location.reload();
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 500 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <StyledCard>
      <CardContent sx={{ padding: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}

        {loading && !data && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <CircularProgress size={40} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '300px',
            color: 'error.main'
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Error loading category sales data: Network Error
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        )}
        
        {data && data.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ 
              flexBasis: '40%', 
              display: 'flex', 
              justifyContent: 'center', 
              mb: { xs: 3, md: 0 } 
            }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ flexBasis: '60%', flexGrow: 1, pl: { xs: 0, md: 3 }, mt: { xs: 3, md: 0 } }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell>Category</StyledTableHeadCell>
                      <StyledTableHeadCell>Revenue</StyledTableHeadCell>
                      <StyledTableHeadCell>Percentage</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.map((category, index) => (
                      <TableRow key={index} hover>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: category.color,
                                mr: 1.5,
                              }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {category.name}
                            </Typography>
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(category.value)}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <StyledLinearProgress
                                variant="determinate"
                                value={category.percentage}
                                sx={{
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: category.color,
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">
                                {category.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
        
        {data && data.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
            No revenue breakdown data available
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default RevenueBreakdown; 
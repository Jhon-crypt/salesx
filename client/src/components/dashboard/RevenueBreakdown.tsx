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
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import apiService from '../../services/apiService';
import { RevenueBreakdownData, transformRevenueBreakdown } from '../../utils/dataTransformers';

// We can use the interface from dataTransformers
type RevenueCategory = RevenueBreakdownData;

interface RevenueBreakdownProps {
  title: string;
  subtitle?: string;
  data?: RevenueCategory[]; // Make optional to support both prop-based and API-fetched data
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

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({
  title,
  subtitle,
  data: propData,
}) => {
  const theme = useTheme();
  const [data, setData] = useState<RevenueCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If data is provided via props, use that
    if (propData && propData.length > 0) {
      setData(propData);
      return;
    }

    // Otherwise fetch from API
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemSalesData = await apiService.getItemSales();
        if (itemSalesData && itemSalesData.length > 0) {
          const revenueData = transformRevenueBreakdown(itemSalesData);
          setData(revenueData);
        } else {
          setError('No revenue data available');
        }
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Could not load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [propData]);

  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
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
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : data.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
            <Box sx={{ flexBasis: '40%', height: 200, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${formatCurrency(value)}`, 'Revenue']} 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                    }}
                  />
                  <Legend />
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
                    {data.map((category, index) => (
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
                        <StyledTableCell sx={{ width: '40%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <StyledLinearProgress
                                variant="determinate"
                                value={category.percentage}
                                sx={{ bgcolor: theme.palette.background.default, '& .MuiLinearProgress-bar': { bgcolor: category.color } }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                              {category.percentage}%
                            </Typography>
                          </Box>
                        </StyledTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography color="text.secondary">No revenue data available</Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default RevenueBreakdown; 
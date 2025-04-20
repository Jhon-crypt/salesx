import React from 'react';
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
import useApi from '../../hooks/useApi';
import { dbApi, CategorySales } from '../../services/api';

interface RevenueBreakdownProps {
  title: string;
  subtitle?: string;
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
}) => {
  const theme = useTheme();
  
  // Fetch category sales data from API
  const { data: categorySales, isLoading, error } = useApi(() => dbApi.getCategorySales());

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            Error loading category sales data: {error.message}
          </Typography>
        ) : categorySales?.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
            No revenue breakdown data available
          </Typography>
        ) : (
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
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categorySales?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[3],
                    }}
                  />
                  <Legend 
                    formatter={(value, entry, index) => {
                      return <span style={{ color: theme.palette.text.primary }}>{value}</span>;
                    }}
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
                    {categorySales?.map((category, index) => (
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
      </CardContent>
    </StyledCard>
  );
};

export default RevenueBreakdown; 
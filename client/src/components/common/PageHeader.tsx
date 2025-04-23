import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Breadcrumbs, 
  Link, 
  Divider, 
  TextField,
  useTheme 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StoreSelector from './StoreSelector';
import { useStore } from '../../contexts/StoreContext';
import { format } from 'date-fns';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showStoreSelector?: boolean;
  showDatePicker?: boolean;
  date?: string;
  onDateChange?: (date: string) => void;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showStoreSelector = true,
  showDatePicker = true,
  date = format(new Date(), 'yyyy-MM-dd'),
  onDateChange,
  breadcrumbs = []
}) => {
  const theme = useTheme();
  const { selectedStore } = useStore();
  
  // Append store name to title if available
  const displayTitle = selectedStore && showStoreSelector
    ? `${title} - ${selectedStore.store_name}`
    : title;
    
  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onDateChange) {
      onDateChange(event.target.value);
    }
  };
  
  return (
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ 
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            {displayTitle}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          
          {breadcrumbs.map((crumb, index) => (
            crumb.href ? (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {showStoreSelector && (
            <StoreSelector
              useGlobalContext={true}
              width={200}
              label="Select Store"
            />
          )}
          
          {showStoreSelector && showDatePicker && (
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          )}
          
          {showDatePicker && (
            <TextField
              label="Select Date"
              type="date"
              value={date}
              onChange={handleDateChange}
              sx={{ width: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader; 
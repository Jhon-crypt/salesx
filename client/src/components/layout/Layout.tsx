import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* App Header */}
      <Header onSidebarToggle={handleDrawerToggle} />
      
      {/* Sidebar */}
      <Sidebar
        open={isSmallScreen ? mobileOpen : true}
        onClose={handleDrawerToggle}
        variant={isSmallScreen ? "temporary" : "permanent"}
      />
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 260px)` },
          backgroundColor: theme.palette.background.default,
          overflow: 'auto',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar /> {/* This creates space for the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 
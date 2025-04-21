import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Box, 
  Divider, 
  Collapse,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CancelIcon from '@mui/icons-material/Cancel';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorefrontIcon from '@mui/icons-material/Storefront';

const DRAWER_WIDTH = 260;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.5rem',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
  marginLeft: theme.spacing(1),
  fontFamily: "'Poppins', sans-serif",
}));

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "persistent" | "temporary";
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Sales',
    path: '/sales',
    icon: <ReceiptIcon />,
    children: [
      {
        title: 'Transactions',
        path: '/sales/transactions',
        icon: <ReceiptIcon />,
      },
      {
        title: 'Void Transactions',
        path: '/sales/void-transactions',
        icon: <CancelIcon />,
      },
      {
        title: 'Sales Report',
        path: '/sales/report',
        icon: <AssessmentIcon />,
      },
    ],
  },
  {
    title: 'Stores',
    path: '/stores',
    icon: <StorefrontIcon />,
  },
  {
    title: 'Menu',
    path: '/menu',
    icon: <MenuBookIcon />,
    children: [
      {
        title: 'Menu Analysis',
        path: '/menu/analysis',
        icon: <BarChartIcon />,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant = "permanent" }) => {
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleSubMenuClick = (title: string) => {
    setOpenSubMenu(openSubMenu === title ? null : title);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2),
          height: 64,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Box 
          sx={{ 
            bgcolor: 'white', 
            borderRadius: '8px', 
            p: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RestaurantIcon sx={{ color: theme.palette.primary.main }} />
        </Box>
        <LogoText sx={{ color: 'white' }}>
          SalesX
        </LogoText>
        {isSmallScreen && (
          <IconButton
            onClick={onClose}
            sx={{ ml: 'auto', color: theme.palette.primary.contrastText }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List component="nav" sx={{ p: 1 }}>
        {navItems.map((item) => {
          const isItemActive = isActive(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = openSubMenu === item.title;

          return (
            <React.Fragment key={item.title}>
              <ListItem disablePadding>
                <ListItemButton
                  component={hasChildren ? 'div' : Link}
                  to={hasChildren ? undefined : item.path}
                  onClick={hasChildren ? () => handleSubMenuClick(item.title) : undefined}
                  selected={isItemActive}
                  sx={{
                    borderRadius: '8px',
                    mb: 0.5,
                    backgroundColor: isItemActive ? `${theme.palette.primary.main}10` : 'transparent',
                    color: isItemActive ? theme.palette.primary.main : theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}15`,
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isItemActive ? theme.palette.primary.main : theme.palette.text.primary,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children?.map((child) => {
                      const isChildActive = isActive(child.path);
                      
                      return (
                        <ListItem key={child.title} disablePadding>
                          <ListItemButton
                            component={Link}
                            to={child.path}
                            selected={isChildActive}
                            sx={{
                              pl: 4,
                              borderRadius: '8px',
                              mb: 0.5,
                              backgroundColor: isChildActive ? `${theme.palette.primary.main}10` : 'transparent',
                              color: isChildActive ? theme.palette.primary.main : theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: `${theme.palette.primary.main}15`,
                              },
                            }}
                          >
                            <ListItemIcon 
                              sx={{ 
                                color: isChildActive ? theme.palette.primary.main : theme.palette.text.primary,
                                minWidth: 40,
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText primary={child.title} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  return isSmallScreen ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  ) : (
    <StyledDrawer variant={variant} open={open} onClose={onClose}>
      {drawer}
    </StyledDrawer>
  );
};

export default Sidebar; 
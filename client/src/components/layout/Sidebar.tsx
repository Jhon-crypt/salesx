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
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';

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
        title: 'Orders',
        path: '/sales/orders',
        icon: <ReceiptIcon />,
      },
      {
        title: 'Invoices',
        path: '/sales/invoices',
        icon: <ReceiptIcon />,
      },
      {
        title: 'Transactions',
        path: '/sales/transactions',
        icon: <ReceiptIcon />,
      },
    ],
  },
  {
    title: 'Menu',
    path: '/menu',
    icon: <MenuBookIcon />,
    children: [
      {
        title: 'Categories',
        path: '/menu/categories',
        icon: <MenuBookIcon />,
      },
      {
        title: 'Items',
        path: '/menu/items',
        icon: <RestaurantIcon />,
      },
      {
        title: 'Modifiers',
        path: '/menu/modifiers',
        icon: <MenuBookIcon />,
      },
    ],
  },
  {
    title: 'Tables',
    path: '/tables',
    icon: <TableRestaurantIcon />,
  },
  {
    title: 'Inventory',
    path: '/inventory',
    icon: <InventoryIcon />,
  },
  {
    title: 'Customers',
    path: '/customers',
    icon: <PeopleIcon />,
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: <InsightsIcon />,
    children: [
      {
        title: 'Sales Report',
        path: '/analytics/sales',
        icon: <InsightsIcon />,
      },
      {
        title: 'Customer Insights',
        path: '/analytics/customers',
        icon: <InsightsIcon />,
      },
      {
        title: 'Inventory Report',
        path: '/analytics/inventory',
        icon: <InsightsIcon />,
      },
    ],
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
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
        <Typography variant="h6" fontWeight="bold">
          RestaurantX
        </Typography>
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
                    {item.children.map((child) => {
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
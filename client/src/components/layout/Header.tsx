import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Box, 
  Menu, 
  MenuItem, 
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  Tooltip,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import StoreSelector from '../common/StoreSelector';
import { useStoreContext } from '../../contexts/StoreContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.text.primary, 0.5),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2),
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

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { stores, selectedStoreId, setSelectedStoreId, selectedStore } = useStoreContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onSidebarToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Logo */}
        <LogoContainer>
          <Box 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              borderRadius: '8px', 
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <RestaurantIcon />
          </Box>
          <LogoText>
            SalesX
          </LogoText>
        </LogoContainer>
        
        {/* Store Selector */}
        <Box sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}>
          <StoreSelector
            stores={stores}
            selectedStoreId={selectedStoreId}
            onChange={setSelectedStoreId}
            size="small"
            showCount={false}
          />
        </Box>
        
        {/* Search Bar */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Mobile Store Selector Button */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}>
          <Tooltip title="Select Store">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => navigate('/stores')} 
              color="primary"
              sx={{ height: 32 }}
            >
              {selectedStore ? selectedStore.store_name : 'All Stores'}
            </Button>
          </Tooltip>
        </Box>
        
        {/* Avatar/Profile */}
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleProfileMenuOpen}
          sx={{ 
            backgroundColor: anchorEl ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <Avatar 
            alt="John Doe" 
            src="/path/to/image.jpg"
            sx={{ width: 32, height: 32 }}
          >
            JD
          </Avatar>
        </IconButton>
      </Toolbar>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 220,
            borderRadius: '12px',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">John Doe</Typography>
          <Typography variant="body2" color="text.secondary">Restaurant Manager</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 
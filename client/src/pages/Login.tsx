import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  InputAdornment, 
  IconButton,
  useTheme,
  Divider,
  Stack,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { loginUser } from '../utils/authUtils';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      try {
        // Call secure login function
        await loginUser(email, password);
        
        // Update auth context
        login();
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        setLoginError('Invalid email or password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}22 0%, ${theme.palette.secondary.light}22 100%)`,
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          maxWidth: 450, 
          borderRadius: 2,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          margin: '0 auto',
          position: 'relative',
          height: { xs: 'auto', sm: '600px' },
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
          }}>
            <RestaurantIcon sx={{ 
              fontSize: 40, 
              color: theme.palette.primary.main,
              mr: 1,
            }} />
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              SalesX
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="medium" mb={1}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage your restaurant
          </Typography>
        </Box>

        {/* Show error if login fails */}
        <Collapse in={!!loginError}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setLoginError('')}
          >
            {loginError}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Link href="#" variant="body2" color="primary.main">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ 
              mb: 3, 
              py: 1.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>

          <Stack spacing={2} direction="row" sx={{ mb: 3 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 1.5 }}
              onClick={() => console.log('Google login')}
            >
              Google
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ py: 1.5 }}
              onClick={() => console.log('Apple login')}
            >
              Apple
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                href="#" 
                variant="body2" 
                sx={{ fontWeight: 600 }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    success: Palette['primary'];
    warning: Palette['primary'];
    danger: Palette['primary'];
  }
  interface PaletteOptions {
    tertiary: PaletteOptions['primary'];
    success: PaletteOptions['primary'];
    warning: PaletteOptions['primary'];
    danger: PaletteOptions['primary'];
  }
}

// Custom color scheme for a restaurant dashboard
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1e3a8a', // Deep blue
      light: '#5271c2',
      dark: '#0d2b6b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f97316', // Orange
      light: '#fb923c',
      dark: '#ea580c',
      contrastText: '#ffffff',
    },
    danger: {
      main: '#dc2626', // Red
      light: '#ef4444',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    background: {
      default: '#f9fafb', 
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      disabled: '#9ca3af',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 1px 5px rgba(0, 0, 0, 0.05), 0px 1px 8px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 8px rgba(0, 0, 0, 0.1)',
    '0px 3px 5px rgba(0, 0, 0, 0.04), 0px 4px 12px rgba(0, 0, 0, 0.08)',
    '0px 4px 6px rgba(0, 0, 0, 0.04), 0px 5px 14px rgba(0, 0, 0, 0.08)',
    '0px 5px 8px rgba(0, 0, 0, 0.04), 0px 6px 16px rgba(0, 0, 0, 0.08)',
    '0px 6px 10px rgba(0, 0, 0, 0.04), 0px 8px 22px rgba(0, 0, 0, 0.08)',
    '0px 7px 12px rgba(0, 0, 0, 0.04), 0px 9px 28px rgba(0, 0, 0, 0.08)',
    '0px 8px 14px rgba(0, 0, 0, 0.04), 0px 10px 32px rgba(0, 0, 0, 0.08)',
    '0px 9px 16px rgba(0, 0, 0, 0.04), 0px 12px 36px rgba(0, 0, 0, 0.08)',
    '0px 10px 18px rgba(0, 0, 0, 0.04), 0px 14px 40px rgba(0, 0, 0, 0.08)',
    '0px 12px 20px rgba(0, 0, 0, 0.04), 0px 16px 48px rgba(0, 0, 0, 0.08)',
    '0px 14px 22px rgba(0, 0, 0, 0.04), 0px 18px 52px rgba(0, 0, 0, 0.08)',
    '0px 16px 24px rgba(0, 0, 0, 0.04), 0px 20px 56px rgba(0, 0, 0, 0.08)',
    '0px 18px 28px rgba(0, 0, 0, 0.04), 0px 22px 60px rgba(0, 0, 0, 0.08)',
    '0px 20px 32px rgba(0, 0, 0, 0.04), 0px 24px 64px rgba(0, 0, 0, 0.08)',
    '0px 22px 36px rgba(0, 0, 0, 0.04), 0px 26px 72px rgba(0, 0, 0, 0.08)',
    '0px 24px 40px rgba(0, 0, 0, 0.04), 0px 28px 80px rgba(0, 0, 0, 0.08)',
    '0px 26px 44px rgba(0, 0, 0, 0.04), 0px 32px 88px rgba(0, 0, 0, 0.08)',
    '0px 28px 48px rgba(0, 0, 0, 0.04), 0px 36px 96px rgba(0, 0, 0, 0.08)',
    '0px 30px 52px rgba(0, 0, 0, 0.04), 0px 40px 104px rgba(0, 0, 0, 0.08)',
    '0px 32px 56px rgba(0, 0, 0, 0.04), 0px 44px 112px rgba(0, 0, 0, 0.08)',
    '0px 36px 60px rgba(0, 0, 0, 0.04), 0px 48px 120px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Apply responsive typography
theme = responsiveFontSizes(theme);

export default theme; 
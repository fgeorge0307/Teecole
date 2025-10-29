import { createTheme } from '@mui/material/styles';

// Material 3 Expressive Theme with Josefin Sans
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // Material 3 Primary
      light: '#8E7CC3',
      dark: '#4F378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71', // Material 3 Secondary
      light: '#8A82A0',
      dark: '#4A4458',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#7D5260',
      light: '#A07B8A',
      dark: '#633B48',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A',
      light: '#DE3730',
      dark: '#93000A',
    },
    background: {
      default: '#FFFBFE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
    },
  },
  typography: {
    fontFamily: '"Josefin Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16, // Material 3 expressive rounded corners
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(103, 80, 164, 0.1)',
    '0px 4px 8px rgba(103, 80, 164, 0.12)',
    '0px 8px 16px rgba(103, 80, 164, 0.14)',
    '0px 12px 24px rgba(103, 80, 164, 0.16)',
    '0px 16px 32px rgba(103, 80, 164, 0.18)',
    '0px 20px 40px rgba(103, 80, 164, 0.2)',
    '0px 24px 48px rgba(103, 80, 164, 0.22)',
    '0px 28px 56px rgba(103, 80, 164, 0.24)',
    // Continue with more shadows...
    ...Array(16).fill('0px 32px 64px rgba(103, 80, 164, 0.26)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Pill-shaped buttons
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 16px rgba(103, 80, 164, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6750A4 0%, #8E7CC3 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5A3E9F 0%, #7D6BB0 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0px 16px 32px rgba(103, 80, 164, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0px 2px 8px rgba(103, 80, 164, 0.1)',
        },
      },
    },
  },
});

export default theme;

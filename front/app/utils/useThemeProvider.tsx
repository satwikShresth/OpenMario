import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { type PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Create context for theme management
type ThemeContextType = {
  toggleColorMode: () => void;
  mode: PaletteMode;
};

const ThemeContext = createContext<ThemeContextType>({
  toggleColorMode: () => { },
  mode: 'light'
});

// Custom hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

// Enhanced Super Mario color palette with better harmony
const marioColors = {
  // Primary palette (more saturated but harmonious)
  red: '#E60012',         // Mario red - slightly darker for better contrast
  blue: '#009FE3',        // Sky blue - slightly muted for better harmony
  green: '#1ABC3F',       // Pipe green - adjusted for balance
  yellow: '#FFC300',      // Star/coin yellow - warmer for better pairing

  // Secondary palette
  brown: '#8E562E',       // Question block brown
  lightBlue: '#00D2FF',   // Ice world blue
  orange: '#FF8C00',      // Fire flower orange
  purple: '#9754CE',      // Poison mushroom purple

  // Neutrals
  black: '#000000',       // Outline
  white: '#FFFFFF',       // Background
  cream: '#FFF5E6',       // Paper/menu background
  darkGrey: '#222222',    // Dark mode background

  // Enhanced dark mode colors
  darkBlue: '#1A1E3C',    // Dark mode background - deeper blue
  darkPurple: '#2D1B3E',  // Dark mode secondary background
  neonBlue: '#00EEFF',    // Dark mode accent - glowing blue
  neonPink: '#FF3399',    // Dark mode accent - glowing pink
  neonGreen: '#39FF14',   // Dark mode accent - glowing green
  darkPaper: '#2A2A40',   // Dark mode paper surface
};

// Theme provider component
interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  // Try to get user's preference from localStorage, default to light
  const [mode, setMode] = useState<PaletteMode>('light');

  // Effect to get saved theme from localStorage on initial load
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, []);

  // Theme toggle function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Create theme based on current mode
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        ...(mode === 'light'
          ? {
            // Light mode Mario palette - more harmonious colors
            primary: {
              main: marioColors.red,
              light: '#FF4D60',
              dark: '#BF0010',
              contrastText: marioColors.white,
            },
            secondary: {
              main: marioColors.blue,
              light: '#5BD3FF',
              dark: '#0070A0',
              contrastText: marioColors.white,
            },
            info: {
              main: marioColors.blue,
              light: '#5BD3FF',
              dark: '#0070A0',
              contrastText: marioColors.white,
            },
            warning: {
              main: marioColors.orange,
              light: '#FFB04D',
              dark: '#CC7000',
              contrastText: marioColors.black,
            },
            error: {
              main: marioColors.red,
              light: '#FF4D60',
              dark: '#BF0010',
              contrastText: marioColors.white,
            },
            success: {
              main: marioColors.green,
              light: '#4DE974',
              dark: '#108A30',
              contrastText: marioColors.white,
            },
            background: {
              default: marioColors.cream,
              paper: marioColors.white,
            },
            text: {
              primary: '#222222',
              secondary: '#666666',
            },
            divider: 'rgba(0, 0, 0, 0.09)',
          }
          : {
            // Dark mode Mario palette - vibrant and neon-inspired for better contrast
            primary: {
              main: marioColors.neonPink,
              light: '#FF70B5',
              dark: '#CC0055',
              contrastText: marioColors.white,
            },
            secondary: {
              main: marioColors.neonBlue,
              light: '#70FFFF',
              dark: '#00AACC',
              contrastText: marioColors.black,
            },
            info: {
              main: marioColors.lightBlue,
              light: '#7EEAFF',
              dark: '#00A0CB',
              contrastText: marioColors.black,
            },
            warning: {
              main: marioColors.yellow,
              light: '#FFD54D',
              dark: '#CC9C00',
              contrastText: marioColors.black,
            },
            error: {
              main: marioColors.red,
              light: '#FF4D60',
              dark: '#BF0010',
              contrastText: marioColors.white,
            },
            success: {
              main: marioColors.neonGreen,
              light: '#85FF70',
              dark: '#15CC00',
              contrastText: marioColors.black,
            },
            background: {
              default: marioColors.darkBlue,
              paper: marioColors.darkPaper,
            },
            text: {
              primary: '#F5F5F5',
              secondary: '#BBBBBB',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
          }),
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h5: {
          fontWeight: 700,
        },
        h6: {
          fontWeight: 600,
        },
        subtitle1: {
          fontWeight: 500,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 25, // Rounded buttons like Mario coins
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '8px 16px',
              boxShadow: `0 4px 0 ${mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.8)'}`,
              border: `2px solid ${marioColors.black}`,
              transition: 'all 0.1s ease-in-out',
              '&:hover': {
                transform: 'translateY(2px)',
                boxShadow: `0 2px 0 ${mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.8)'}`,
                filter: 'brightness(1.05)',
              },
              '&:active': {
                transform: 'translateY(4px)',
                boxShadow: 'none',
                filter: 'brightness(0.95)',
              },
            },
            // Color variants with coordinated styles
            containedPrimary: {
              backgroundColor: mode === 'light' ? marioColors.red : marioColors.neonPink,
              color: marioColors.white,
              '&:hover': {
                backgroundColor: mode === 'light' ? marioColors.red : marioColors.neonPink,
              },
            },
            containedSecondary: {
              backgroundColor: mode === 'light' ? marioColors.blue : marioColors.neonBlue,
              color: mode === 'light' ? marioColors.white : marioColors.black,
              '&:hover': {
                backgroundColor: mode === 'light' ? marioColors.blue : marioColors.neonBlue,
              },
            },
            outlinedPrimary: {
              borderColor: mode === 'light' ? marioColors.red : marioColors.neonPink,
              color: mode === 'light' ? marioColors.red : marioColors.neonPink,
              backgroundColor: mode === 'light' ? `${marioColors.red}10` : `${marioColors.neonPink}20`,
            },
            outlinedSecondary: {
              borderColor: mode === 'light' ? marioColors.blue : marioColors.neonBlue,
              color: mode === 'light' ? marioColors.blue : marioColors.neonBlue,
              backgroundColor: mode === 'light' ? `${marioColors.blue}10` : `${marioColors.neonBlue}20`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              border: `3px solid ${marioColors.black}`,
              boxShadow: mode === 'light'
                ? `0 8px 0 rgba(0,0,0,0.5)`
                : `0 8px 0 rgba(0,0,0,0.8), 0 0 15px ${marioColors.neonBlue}50`,
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: mode === 'light'
                  ? `0 12px 0 rgba(0,0,0,0.5)`
                  : `0 12px 0 rgba(0,0,0,0.8), 0 0 20px ${marioColors.neonBlue}70`
              },
              ...(mode === 'dark' && {
                background: `linear-gradient(135deg, ${marioColors.darkPaper} 0%, ${marioColors.darkPurple} 100%)`,
              }),
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            rounded: {
              borderRadius: 16,
            },
            root: {
              backgroundImage: mode === 'light'
                ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 10px, rgba(0,0,0,0) 10px, rgba(0,0,0,0) 20px)'
                : 'none',
              ...(mode === 'dark' && {
                boxShadow: '0 0 10px rgba(0,170,255,0.2)'
              }),
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: `0 6px 0 ${mode === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.8)'}`,
              borderBottom: `3px solid ${marioColors.black}`,
              backgroundColor: mode === 'light'
                ? marioColors.white
                : marioColors.darkBlue,
              backgroundImage: mode === 'light'
                ? `linear-gradient(90deg, ${marioColors.white} 50%, ${marioColors.cream} 100%)`
                : `linear-gradient(90deg, ${marioColors.darkBlue} 0%, ${marioColors.darkPurple} 100%)`,
              ...(mode === 'dark' && {
                boxShadow: `0 6px 0 rgba(0,0,0,0.8), 0 0 15px rgba(0,210,255,0.3)`,
              }),
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'light'
                ? marioColors.cream
                : marioColors.darkBlue,
              borderRight: `3px solid ${marioColors.black}`,
              backgroundImage: mode === 'light'
                ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 10px, rgba(0,0,0,0) 10px, rgba(0,0,0,0) 20px)'
                : `radial-gradient(circle at 100% 100%, ${marioColors.darkPurple} 0%, ${marioColors.darkBlue} 100%)`,
              ...(mode === 'dark' && {
                boxShadow: 'inset 0 0 20px rgba(0,210,255,0.1)',
              }),
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            switchBase: {
              color: mode === 'light' ? marioColors.yellow : marioColors.neonBlue,
              '&.Mui-checked': {
                color: mode === 'light' ? marioColors.green : marioColors.neonGreen,
              },
              '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: mode === 'light'
                  ? `${marioColors.green}90`
                  : `${marioColors.neonGreen}90`,
                opacity: 1,
              },
            },
            track: {
              backgroundColor: mode === 'light'
                ? `${marioColors.yellow}90`
                : `${marioColors.neonBlue}90`,
              opacity: 1,
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              borderBottom: `2px solid ${marioColors.black}`,
            },
            indicator: {
              backgroundColor: mode === 'light'
                ? marioColors.red
                : marioColors.neonPink,
              height: 4,
              borderRadius: '4px 4px 0 0',
              ...(mode === 'dark' && {
                boxShadow: `0 0 8px ${marioColors.neonPink}`,
              }),
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: mode === 'light'
                  ? marioColors.red
                  : marioColors.neonPink,
                backgroundColor: mode === 'light'
                  ? `${marioColors.red}10`
                  : `${marioColors.neonPink}20`,
              },
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? 'rgba(0,0,0,0.04)'
                  : 'rgba(255,255,255,0.04)',
                color: mode === 'light'
                  ? marioColors.red
                  : marioColors.neonPink,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              border: `2px solid ${marioColors.black}`,
              borderRadius: 16,
              ...(mode === 'dark' && {
                boxShadow: '0 0 5px rgba(255,255,255,0.2)',
              }),
            },
            colorPrimary: {
              backgroundColor: mode === 'light'
                ? marioColors.red
                : marioColors.neonPink,
              color: marioColors.white,
            },
            colorSecondary: {
              backgroundColor: mode === 'light'
                ? marioColors.blue
                : marioColors.neonBlue,
              color: mode === 'light'
                ? marioColors.white
                : marioColors.black,
            },
            colorSuccess: {
              backgroundColor: mode === 'light'
                ? marioColors.green
                : marioColors.neonGreen,
              color: mode === 'light'
                ? marioColors.white
                : marioColors.black,
            },
            colorWarning: {
              backgroundColor: marioColors.yellow,
              color: marioColors.black,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              margin: '4px 0',
              '&.Mui-selected': {
                backgroundColor: mode === 'light'
                  ? `${marioColors.yellow}30`
                  : `${marioColors.neonBlue}20`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: '70%',
                  backgroundColor: mode === 'light'
                    ? marioColors.yellow
                    : marioColors.neonBlue,
                  borderRadius: '0 4px 4px 0',
                  ...(mode === 'dark' && {
                    boxShadow: `0 0 8px ${marioColors.neonBlue}`,
                  }),
                },
              },
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? 'rgba(0,0,0,0.04)'
                  : 'rgba(255,255,255,0.04)',
              },
            },
          },
        },
      },
    }),
    [mode]
  );

  // Context value
  const contextValue = useMemo(() => ({
    toggleColorMode,
    mode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;

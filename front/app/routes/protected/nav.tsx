import { NavLink, useLocation } from 'react-router';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  useTheme,
  Container,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Sun,
  Moon,
  Home,
  Briefcase,
  Upload,
  User
} from 'lucide-react';
import { useAppTheme } from '#/utils/useThemeProvider';

const SuperMarioNavbar = () => {
  const { toggleColorMode, mode } = useAppTheme();
  const theme = useTheme();
  const location = useLocation();

  // Mario theme colors
  const colors = {
    // Light mode colors
    red: '#E60012', // Mario's hat/shirt
    blue: '#0088CC', // Sky/water color
    yellow: '#FFCB05', // Coins/stars 
    green: '#3AA54B', // Pipes/Luigi
    brown: '#854C1E', // Blocks

    // Dark mode colors
    neonPink: '#FF3399', // Neon pink for dark mode
    neonBlue: '#00EEFF', // Neon blue for dark mode
    neonGreen: '#39FF14', // Neon green for dark mode
    neonYellow: '#FFFF00', // Neon yellow for dark mode

    // Common colors
    black: '#000000',
    white: '#FFFFFF',
    gray: '#333333',
    darkBlue: '#1A1E3C' // Dark mode background
  };

  // Get the appropriate color set based on the current mode
  const getColor = (lightColor, darkColor) => mode === 'light' ? lightColor : darkColor;

  // Navigation links with their Mario-themed colors
  const navLinks = [
    {
      text: 'Home',
      path: '/',
      icon: <Home size={20} />,
      color: getColor(colors.red, colors.neonPink),
      glowColor: 'rgba(255, 51, 153, 0.7)' // Pink glow
    },
    {
      text: 'Jobs',
      path: '/jobs',
      icon: <Briefcase size={20} />,
      color: getColor(colors.green, colors.neonGreen),
      glowColor: 'rgba(57, 255, 20, 0.7)' // Green glow
    },
    {
      text: 'Upload',
      path: '/upload',
      icon: <Upload size={20} />,
      color: getColor(colors.yellow, colors.neonYellow),
      glowColor: 'rgba(255, 255, 0, 0.7)' // Yellow glow
    },
    {
      text: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
      color: getColor(colors.blue, colors.neonBlue),
      glowColor: 'rgba(0, 238, 255, 0.7)' // Blue glow
    }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: mode === 'light' ? colors.white : colors.darkBlue,
        boxShadow: mode === 'light'
          ? 'none'
          : '0 0 15px rgba(0, 238, 255, 0.3)',
        borderBottom: `4px solid ${colors.black}`,
        position: 'relative',
        zIndex: 1,
        overflow: 'visible',
        '&::after': {
          content: '""',
          position: 'absolute',
          height: 8,
          bottom: -12,
          left: 0,
          right: 0,
          backgroundColor: colors.black,
          zIndex: -1,
          borderRadius: '0 0 8px 8px'
        }
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          {/* Logo */}
          <Box
            component={NavLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 3,
              filter: mode === 'dark' ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.6))' : 'none'
            }}
          >
            <Box
              component="img"
              src="/openmario.png"
              alt="OpenMario"
              sx={{
                height: 42,
                width: 'auto',
                display: 'block'
              }}
            />
          </Box>

          {/* Navigation items */}
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              gap: 1
            }}
          >
            {navLinks.map((link) => (
              <Box
                key={link.text}
                component={NavLink}
                to={link.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  bgcolor: isActive(link.path) ? link.color : 'transparent',
                  color: isActive(link.path)
                    ? colors.white
                    : mode === 'light'
                      ? colors.black
                      : colors.white,
                  textDecoration: 'none',
                  height: 48,
                  px: 2.5,
                  borderRadius: isActive(link.path) ? '8px 8px 0 0' : 4,
                  fontWeight: isActive(link.path) ? 700 : 600,
                  fontSize: '0.95rem',
                  border: isActive(link.path) ? `3px solid ${colors.black}` : 'none',
                  borderBottom: isActive(link.path) ? 0 : 'none',
                  position: 'relative',
                  top: isActive(link.path) ? 8 : 0,
                  zIndex: isActive(link.path) ? 2 : 1,
                  transition: 'all 0.2s ease-in-out',
                  overflow: 'hidden',

                  // Add glow effect for dark mode
                  ...(mode === 'dark' && isActive(link.path) && {
                    boxShadow: `0 0 15px ${link.glowColor}`,
                  }),

                  // Shine effect for active tabs
                  ...(isActive(link.path) && {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: -50,
                      width: 50,
                      height: '100%',
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'skewX(-25deg)',
                      animation: 'shine 4s infinite',
                      '@keyframes shine': {
                        '0%': { left: -50 },
                        '20%': { left: '150%' },
                        '100%': { left: '150%' }
                      }
                    }
                  }),

                  // Dark mode specific hover effects
                  ...(mode === 'dark' && !isActive(link.path) && {
                    '&:hover': {
                      bgcolor: `${link.color}22`,
                      color: link.color,
                      transform: 'scale(1.05)',
                      boxShadow: `0 0 10px ${link.glowColor}`,
                      transition: 'all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                    }
                  }),

                  // Light mode hover effects
                  ...(mode === 'light' && !isActive(link.path) && {
                    '&:hover': {
                      bgcolor: `${link.color}22`,
                      color: link.color,
                      transform: 'scale(1.05)',
                      boxShadow: `0 3px 0 ${colors.black}`,
                      transition: 'all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                    }
                  }),

                  // Add a playful icon pop on hover
                  '& svg': {
                    transition: isActive(link.path) ? 'none' : 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                  },
                  '&:hover svg': {
                    transform: isActive(link.path) ? 'none' : 'scale(1.15) rotate(-5deg)',
                    color: isActive(link.path) ? 'none' : link.color
                  },

                  // Display shadow below active tab
                  ...(isActive(link.path) && {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: -4,
                      right: -4,
                      height: 8,
                      backgroundColor: link.color,
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                      zIndex: -1,
                      ...(mode === 'dark' && {
                        boxShadow: `0 4px 8px ${link.glowColor}`
                      })
                    }
                  })
                }}
              >
                <Box sx={{
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  ...(mode === 'dark' && {
                    filter: isActive(link.path) ? 'none' : `drop-shadow(0 0 2px ${link.color})`
                  })
                }}>
                  {link.icon}
                </Box>
                {link.text}
              </Box>
            ))}
          </Box>

          {/* Theme Toggle Button */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleColorMode}
              sx={{
                width: 46,
                height: 46,
                bgcolor: mode === 'dark' ? colors.neonYellow : colors.blue,
                color: colors.black,
                border: `3px solid ${colors.black}`,
                borderRadius: '50%',
                boxShadow: mode === 'dark'
                  ? '0 4px 0 rgba(0,0,0,0.6), 0 0 10px rgba(255,255,0,0.7)'
                  : '0 4px 0 rgba(0,0,0,0.6)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: mode === 'dark' ? colors.neonYellow : colors.blue,
                  transform: 'translateY(2px)',
                  boxShadow: mode === 'dark'
                    ? '0 2px 0 rgba(0,0,0,0.6), 0 0 10px rgba(255,255,0,0.5)'
                    : '0 2px 0 rgba(0,0,0,0.6)',
                  filter: 'brightness(1.1)'
                }
              }}
            >
              {mode === 'dark' ? (
                <Sun size={22} color={colors.black} />
              ) : (
                <Moon size={22} color={colors.white} />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default SuperMarioNavbar;

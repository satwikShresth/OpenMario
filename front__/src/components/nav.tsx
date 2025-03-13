import { Link, useLocation } from '@tanstack/react-router';
import { AppBar, Toolbar, Box, IconButton, Container, Tooltip } from '@mui/material';
import { Sun, Moon, Home, Upload, User } from 'lucide-react';
import { useAppTheme } from '#/utils/useThemeProvider';
import { useState } from 'react';

export default () => {
  const { toggleColorMode, mode } = useAppTheme();
  const location = useLocation();
  const [isLogoHovered, setIsLogoHovered] = useState(false);



  const colors = {
    // Light mode colors
    red: '#E60012', // Mario's hat/shirt
    blue: '#0088CC', // Sky/water color
    yellow: '#FFCB05', // Coins/stars 
    green: '#3AA54B', // Pipes/Luigi
    brown: '#854C1E', // Blocks

    neonPink: '#FF3399', // Neon pink for dark mode
    neonBlue: '#00EEFF', // Neon blue for dark mode
    neonGreen: '#39FF14', // Neon green for dark mode
    neonYellow: '#FFFF00', // Neon yellow for dark mode

    black: '#121212',
    white: '#FFFFFF',
    gray: '#333333',
    darkBlue: '#1A1E3C' // Dark mode background
  };

  // Get the appropriate color set based on the current mode
  const getColor = (lightColor, darkColor) => mode === 'light' ? lightColor : darkColor;

  // Navigation links including Profile - all with the same styling approach
  const navLinks = [
    {
      text: 'Home',
      path: '/home',
      icon: <Home size={20} />,
      color: getColor(colors.red, colors.neonPink),
      glowColor: 'rgba(255, 51, 153, 0.7)' // Pink glow
    },
    {
      text: 'Submissions',
      path: '/submission',
      icon: <Upload size={20} />,
      color: getColor(colors.green, colors.neonGreen),
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
        borderBottom: `5px solid ${colors.black}`,
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
          {/* Logo with elegant hover effect */}
          <Box
            component={Link}
            to="/"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              mr: 3,
              height: 50,
              transition: 'transform 0.3s ease-out',
              transform: isLogoHovered ? 'scale(1.08)' : 'scale(1)',
              '&::after': isLogoHovered ? {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: 3,
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${mode === 'light' ? colors.red : colors.neonPink} 20%, 
                  ${mode === 'light' ? colors.blue : colors.neonBlue} 50%, 
                  ${mode === 'light' ? colors.green : colors.neonGreen} 80%, 
                  transparent 100%)`,
                borderRadius: 4,
                opacity: 0.8,
                animation: 'rainbow 2s linear infinite',
                '@keyframes rainbow': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '100%': { backgroundPosition: '100% 50%' }
                }
              } : {}
            }}
          >
            <Box
              component="img"
              src="/openmario.png"
              alt="OpenMario"
              sx={{
                height: 42,
                width: 'auto',
                display: 'block',
                filter: isLogoHovered
                  ? mode === 'light'
                    ? 'drop-shadow(0 0 3px rgba(230, 0, 18, 0.5))'
                    : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
                  : mode === 'dark'
                    ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))'
                    : 'none',
                transition: 'all 0.3s ease',
                animation: isLogoHovered
                  ? 'float 3s ease-in-out infinite'
                  : 'none',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-5px)' }
                }
              }}
            />

            {/* Star effect elements */}
            {isLogoHovered && [...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: i % 2 === 0 ? 4 : 3,
                  height: i % 2 === 0 ? 4 : 3,
                  borderRadius: '50%',
                  backgroundColor: i % 3 === 0
                    ? mode === 'light' ? colors.yellow : colors.neonYellow
                    : i % 3 === 1
                      ? mode === 'light' ? colors.red : colors.neonPink
                      : mode === 'light' ? colors.blue : colors.neonBlue,
                  filter: `blur(${i % 2 === 0 ? '0' : '1px'})`,
                  opacity: 0,
                  animation: `twinkle 2s ease-in-out ${i * 0.3}s infinite`,
                  top: '50%',
                  left: '50%',
                  transform: `translate(
                    ${(Math.cos(i * Math.PI / 3) * 30)}px, 
                    ${(Math.sin(i * Math.PI / 3) * 30)}px
                  )`,
                  '@keyframes twinkle': {
                    '0%, 100%': {
                      opacity: 0, transform: `translate(
                      ${(Math.cos(i * Math.PI / 3) * 30)}px, 
                      ${(Math.sin(i * Math.PI / 3) * 30)}px
                    ) scale(0.5)` },
                    '50%': {
                      opacity: 0.8, transform: `translate(
                      ${(Math.cos(i * Math.PI / 3) * 35)}px, 
                      ${(Math.sin(i * Math.PI / 3) * 35)}px
                    ) scale(1)` }
                  }
                }}
              />
            ))}
          </Box>

          {/* Navigation items with Profile included */}
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
                component={Link}
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
                bgcolor: mode === 'dark' ? colors.blue : colors.neonYellow,
                color: colors.black,
                border: `3px solid ${colors.black}`,
                borderRadius: '50%',
                boxShadow: mode === 'dark'
                  ? '0 4px 0 rgba(0,0,0,0.6), 0 0 10px rgba(255,255,0,0.7)'
                  : '0 4px 0 rgba(0,0,0,0.6)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: mode === 'dark' ? colors.blue : colors.neonYellow,
                  transform: 'translateY(2px)',
                  boxShadow: mode === 'dark'
                    ? '0 2px 0 rgba(0,0,0,0.6), 0 0 10px rgba(255,255,0,0.5)'
                    : '0 2px 0 rgba(0,0,0,0.6)',
                  filter: 'brightness(1.1)'
                }
              }}
            >
              {mode === 'dark' ? (
                <Moon size={22} color={colors.white} />
              ) : (
                <Sun size={22} color={colors.black} />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

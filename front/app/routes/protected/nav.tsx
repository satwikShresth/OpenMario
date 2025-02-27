import { NavLink, useLocation } from 'react-router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
  Container,
  Tooltip
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

const Navbar = () => {
  const { toggleColorMode, mode } = useAppTheme();
  const theme = useTheme();
  const location = useLocation();

  // Navigation links configuration
  const navLinks = [
    { text: 'Home', path: '/', icon: <Home size={20} /> },
    { text: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { text: 'Upload', path: '/upload', icon: <Upload size={20} /> },
    { text: 'Profile', path: '/profile', icon: <User size={20} /> }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      color="default"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              fontWeight: 600,
              color: 'primary.main'
            }}
          >
            OpenMario
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {navLinks.map((link) => (
              <Box
                key={link.text}
                component={NavLink}
                to={link.path}
                sx={{
                  position: 'relative',
                  color: isActive(link.path) ? 'primary.main' : 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  px: 2,
                  py: 2,
                  mx: 0.5,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'rgba(25, 118, 210, 0.04)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    bgcolor: isActive(link.path) ? 'primary.main' : 'transparent',
                    transition: 'all 0.2s'
                  }
                }}
              >
                <Box sx={{
                  mr: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {link.icon}
                </Box>
                {link.text}
              </Box>
            ))}
          </Box>

          {/* Dark Mode Toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              sx={{ ml: 1 }}
            >
              {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;

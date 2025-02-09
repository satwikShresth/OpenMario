import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';

export default () => {
  const { login, error, resetError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    login(formData);
  };

  useEffect(() => { if (error) enqueueSnackbar(error, { variant: "error" }) }, [error])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.23)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiOutlinedInput-input': {
      color: 'white',
    },
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          position: 'relative'
        }}
      >
        <Link
          href="/"
          sx={{
            color: 'white',
            '&:hover': {
              color: 'primary.light',
            }
          }}
        >
          Back to Home
        </Link>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              sx={textFieldStyle}
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={textFieldStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mb: 2 }}
          >
            Log In
          </Button>
          <Typography align="center" sx={{ color: 'white' }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              sx={{
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.light',
                }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        color: 'primary.contrastText',
        pb: 1,
        mt: 'auto' // Helps push to bottom in flex containers
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color='text.primary' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Made with <Heart size={16} fill="#ff6d75" color="#ff6d75" style={{ margin: '0 4px' }} /> in Philadelphia
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

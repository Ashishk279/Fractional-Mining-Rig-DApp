import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
        mt: 'auto',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Mining Rig Share Management Platform
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Powered by Ethereum on{' '}
            <Link 
              href="https://amoy.polygonscan.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              Polygon Amoy
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
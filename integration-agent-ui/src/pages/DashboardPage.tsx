import React from 'react';
import { Typography, Box } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the Integration Agent Dashboard
      </Typography>
    </Box>
  );
};

export default DashboardPage; 
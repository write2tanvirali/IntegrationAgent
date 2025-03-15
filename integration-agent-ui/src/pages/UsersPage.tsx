import React from 'react';
import { Typography, Box } from '@mui/material';

const UsersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <Typography variant="body1">
        Manage users here.
      </Typography>
    </Box>
  );
};

export default UsersPage; 
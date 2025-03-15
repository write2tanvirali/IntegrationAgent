import React from 'react';
import { Typography, Box } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Configure settings here.
      </Typography>
    </Box>
  );
};

export default SettingsPage; 
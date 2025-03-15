import React from 'react';
import { Typography, Box } from '@mui/material';

const LogsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Logs
      </Typography>
      <Typography variant="body1">
        View logs here.
      </Typography>
    </Box>
  );
};

export default LogsPage; 
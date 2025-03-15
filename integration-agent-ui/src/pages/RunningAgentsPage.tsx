import React from 'react';
import { Typography, Box } from '@mui/material';

const RunningAgentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Running Agents
      </Typography>
      <Typography variant="body1">
        View and manage running agents here.
      </Typography>
    </Box>
  );
};

export default RunningAgentsPage; 
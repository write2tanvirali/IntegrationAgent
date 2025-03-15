import React from 'react';
import { Box, Typography } from '@mui/material';

interface TaskBoxProps {
  taskName: string;
  onClick: () => void;
}

const TaskBox: React.FC<TaskBoxProps> = ({ taskName, onClick }) => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'lightblue',
        borderRadius: 1,
        cursor: 'pointer',
        mb: 2,
        textAlign: 'center',
      }}
      onClick={onClick}
    >
      <Typography variant="body1">{taskName}</Typography>
    </Box>
  );
};

export default TaskBox; 
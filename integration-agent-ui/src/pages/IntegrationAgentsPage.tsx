import React, { useEffect } from 'react';
import { Typography, Box, Button, List, ListItem, ListItemText, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { fetchAgents } from '../store/agentsSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { Agent } from '../types/agent';

const IntegrationAgentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const agents = useAppSelector((state) => state.agents.agents);
  const agentStatus = useAppSelector((state) => state.agents.status);
  const error = useAppSelector((state) => state.agents.error);

  useEffect(() => {
    if (agentStatus === 'idle') {
      dispatch(fetchAgents());
    }
  }, [agentStatus, dispatch]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Integration Agents
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/newintegrationagent"
        sx={{ mb: 2 }}
      >
        New Integration Agent
      </Button>
      <Paper elevation={3} sx={{ p: 2 }}>
        {agentStatus === 'loading' && <div>Loading...</div>}
        {agentStatus === 'failed' && <div>{error}</div>}
        <List>
          {agents.map((agent: Agent, index: number) => (
            <ListItem key={index} divider>
              <ListItemText primary={agent.name} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default IntegrationAgentsPage; 
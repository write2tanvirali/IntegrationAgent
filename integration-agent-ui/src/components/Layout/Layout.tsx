import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Link, Route, Routes } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';
import IntegrationAgentsPage from '../../pages/IntegrationAgentsPage';
import RunningAgentsPage from '../../pages/RunningAgentsPage';
import UsersPage from '../../pages/UsersPage';
import LogsPage from '../../pages/LogsPage';
import SettingsPage from '../../pages/SettingsPage';
import LogoutPage from '../../pages/LogoutPage';
import NewIntegrationAgentPage from '../../pages/NewIntegrationAgentPage';

const drawerWidth = 240;

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Integration Agent
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Dashboard', 'Integration Agents', 'Running Agents', 'Users', 'Logs', 'Settings', 'Logout'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton component={Link} to={`/${text.replace(/ /g, '').toLowerCase()}`}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/integrationagents" element={<IntegrationAgentsPage />} />
            <Route path="/runningagents" element={<RunningAgentsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/newintegrationagent" element={<NewIntegrationAgentPage />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 
import React from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';
import IntegrationAgentsListPage from '../../pages/IntegrationAgentsListPage';
import IntegrationAgentDetailsPage from '../../pages/IntegrationAgentDetailsPage';
import RunningAgentsPage from '../../pages/RunningAgentsPage';
import UsersPage from '../../pages/UsersPage';
import LogsPage from '../../pages/LogsPage';
import SettingsPage from '../../pages/SettingsPage';
import LogoutPage from '../../pages/LogoutPage';
import NewIntegrationAgentPage from '../../pages/NewIntegrationAgentPage';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const location = useLocation();
  
  // Check if we're on a page that should have full width (no padding)
  const isFullWidthPage = location.pathname.includes('/integrationagents/') || 
                         location.pathname.includes('/newintegrationagent');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-indigo-700 shadow-md z-50">
        <div className="px-4 h-16 flex items-center">
          <img src={require("../../app-icon.png")} alt="Logo" className="h-8 mr-2" />
          <h1 className="text-white font-medium text-xl">
            Integration Agent
          </h1>
        </div>
      </header>
      
      {/* Sidebar */}
      <nav 
        className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-white shadow-md overflow-y-auto"
        style={{ width: `${drawerWidth}px` }}
      >
        <ul className="py-2">
          {[
            { text: 'Dashboard', path: '/dashboard' },
            { text: 'Integration Agents', path: '/integrationagents' },
            { text: 'Running Agents', path: '/runningagents' },
            { text: 'Users', path: '/users' },
            { text: 'Logs', path: '/logs' },
            { text: 'Settings', path: '/settings' },
            { text: 'Logout', path: '/logout' }
          ].map((item) => (
            <li key={item.text}>
              <Link 
                to={item.path}
                className={`block px-4 py-2 text-gray-800 hover:bg-indigo-50 ${
                  location.pathname === item.path ? 'bg-indigo-100' : ''
                }`}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Main Content */}
      <main 
        className={`flex-grow ml-60 mt-16 ${isFullWidthPage ? 'p-0' : 'p-4'}`}
      >
        <div className={isFullWidthPage ? 'w-full p-0 m-0' : 'max-w-7xl mx-auto'}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/integrationagents" element={<IntegrationAgentsListPage />} />
            <Route path="/integrationagents/:id" element={<IntegrationAgentDetailsPage />} />
            <Route path="/runningagents" element={<RunningAgentsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/newintegrationagent" element={<NewIntegrationAgentPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Layout; 
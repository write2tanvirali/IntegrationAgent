import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchIntegrationAgents } from '../services/api';

interface Agent {
  id: number;
  name: string;
  // Add other properties as needed
}

interface AgentContextType {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchIntegrationAgents();
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch integration agents:', error);
      }
    };

    loadAgents();
  }, []);

  return (
    <AgentContext.Provider value={{ agents, setAgents }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
};

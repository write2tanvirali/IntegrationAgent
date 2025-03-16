import React, { useEffect } from 'react';
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
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Integration Agents
      </h1>
      <Link
        to="/newintegrationagent"
        className="btn-primary inline-block mb-4"
      >
        New Integration Agent
      </Link>
      <div className="bg-white rounded-lg shadow-md p-4">
        {agentStatus === 'loading' && <div className="py-4 text-gray-600">Loading...</div>}
        {agentStatus === 'failed' && <div className="py-4 text-red-600">{error}</div>}
        <ul className="divide-y divide-gray-200">
          {agents.map((agent: Agent, index: number) => (
            <li key={index} className="py-3">
              <Link to={`/integrationagents/${agent.id}`} className="block hover:bg-gray-50 transition-colors">
                <span className="text-gray-800">{agent.name}</span>
              </Link>
            </li>
          ))}
          {agents.length === 0 && agentStatus === 'succeeded' && (
            <li className="py-8 text-center text-gray-500">
              No integration agents found. Create one to get started.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default IntegrationAgentsPage; 
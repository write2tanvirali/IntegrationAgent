import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchIntegrationAgents, deleteIntegrationAgent } from '../services/api';
import { IntegrationAgent } from '../types';

const IntegrationAgentsListPage: React.FC = () => {
  const [agents, setAgents] = useState<IntegrationAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [agentToDelete, setAgentToDelete] = useState<IntegrationAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setIsLoading(true);
        const data = await fetchIntegrationAgents();
        setAgents(data);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        setError('Failed to load integration agents');
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleDeleteClick = (agent: IntegrationAgent, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAgentToDelete(agent);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteIntegrationAgent(agentToDelete.id.toString());
      
      // Remove the deleted agent from the list
      setAgents(agents.filter(agent => agent.id !== agentToDelete.id));
      setAgentToDelete(null);
    } catch (err) {
      console.error('Failed to delete agent:', err);
      setError('Failed to delete the integration agent');
    } finally {
      setIsDeleting(false);
    }
  };

  const DeleteConfirmationModal = () => {
    if (!agentToDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete "{agentToDelete.name}"? 
            This action cannot be undone and will delete all associated processes, tasks, and schedules.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setAgentToDelete(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Integration Agents</h1>
        <Link
          to="/newintegrationagent"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Agent
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No integration agents found.</p>
          <p className="text-gray-500 mt-2">Create your first integration agent to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <div 
              key={agent.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-lg font-medium text-gray-900 truncate">{agent.name}</h2>
                <div className="flex space-x-2">
                  {/* Edit button */}
                  <Link
                    to={`/integration-agents/${agent.id}`}
                    className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteClick(agent, e)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Delete ${agent.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* The rest of the card's content remains a Link */}
              <Link 
                to={`/integration-agents/${agent.id}`}
                className="block p-4 pt-0 relative"
              >
                <div className="mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agent.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {agent.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Type: {agent.type}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {'Integration agent of type: ' + agent.type}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmationModal />
    </div>
  );
};

export default IntegrationAgentsListPage; 
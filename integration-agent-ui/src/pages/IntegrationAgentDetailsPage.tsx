import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Canvas from '../components/Canvas/Canvas';
import { fetchIntegrationAgent, updateIntegrationAgent } from '../services/api';
import { IntegrationAgent, Task, ProcessSchedule } from '../types';

// Example: Create a custom hook for task management
function useTaskManagement(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  
  const addTask = (task: Task) => {
    setTasks([...tasks, task])
  }
  
  const updateTask = (taskId: number, updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? updatedTask : task
    ))
  }
  
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }
  
  return { tasks, addTask, updateTask, deleteTask }
}

const IntegrationAgentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<IntegrationAgent | null>(null);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAgent(parseInt(id));
    }
  }, [id]);

  const loadAgent = async (agentId: number) => {
    setIsLoading(true);
    try {
      const data = await fetchIntegrationAgent(agentId);
      setAgent(data);
      setName(data.name);
    } catch (error) {
      console.error('Failed to load agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!agent) return;
    
    try {
      setIsSaving(true);
      await updateIntegrationAgent(agent.id, { ...agent, name });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update agent name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskAdd = (task: Task) => {
    if (!agent) return;
    
    const updatedAgent = {
      ...agent,
      tasks: [...agent.tasks, task]
    };
    
    setAgent(updatedAgent);
    updateIntegrationAgent(agent.id, updatedAgent).catch(error => {
      console.error('Failed to add task:', error);
    });
  };

  const handleTaskUpdate = (taskId: number, updatedTask: Task) => {
    if (!agent) return;
    
    const updatedTasks = agent.tasks.map(task => 
      task.id === taskId ? updatedTask : task
    );
    
    const updatedAgent = {
      ...agent,
      tasks: updatedTasks
    };
    
    setAgent(updatedAgent);
    updateIntegrationAgent(agent.id, updatedAgent).catch(error => {
      console.error('Failed to update task:', error);
    });
  };

  const handleTaskDelete = (taskId: number) => {
    if (!agent) return;
    
    const updatedTasks = agent.tasks.filter(task => task.id !== taskId);
    
    const updatedAgent = {
      ...agent,
      tasks: updatedTasks
    };
    
    setAgent(updatedAgent);
    updateIntegrationAgent(agent.id, updatedAgent).catch(error => {
      console.error('Failed to delete task:', error);
    });
  };

  const handleScheduleUpdate = (schedule: ProcessSchedule) => {
    if (!agent) return;
    
    const updatedAgent = {
      ...agent,
      schedule
    };
    
    setAgent(updatedAgent);
    updateIntegrationAgent(agent.id, updatedAgent).catch(error => {
      console.error('Failed to update schedule:', error);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/integrationagents" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-2 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back to Agents</span>
        </Link>
        
        <div className="flex items-center">
          <div className="relative group flex-1">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="text-2xl font-bold border-b-2 border-transparent focus:border-indigo-500 focus:outline-none bg-transparent pr-10 py-1 w-full transition-colors"
              placeholder="Integration Agent Name"
            />
            {!isEditing && (
              <svg 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors w-5 h-5"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </div>
          
          {isEditing && (
            <button 
              className="ml-2 p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="text-sm font-medium">Save</span>
            </button>
          )}
        </div>
        
        {/* Agent metadata */}
        <div className="flex mt-2 text-sm text-gray-500">
          <div className="mr-4">ID: {agent?.id}</div>
          <div className="mr-4">Type: {agent?.type}</div>
          <div className="flex items-center">
            Status: 
            <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agent?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {agent?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      
      {agent && (
        <Canvas
          agentId={agent.id}
          tasks={agent.tasks || []}
          schedule={agent.schedule}
          onTaskAdd={handleTaskAdd}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onScheduleUpdate={handleScheduleUpdate}
        />
      )}
    </div>
  );
};

export default IntegrationAgentDetailsPage; 
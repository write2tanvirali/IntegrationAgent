import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SaveIcon, ArrowBackIcon } from '../components/Icons';
import Canvas from '../components/Canvas/Canvas';
import { createIntegrationAgent } from '../services/api';
import { Task, ProcessSchedule, Recurrence } from '../types';

const NewIntegrationAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ProcessSchedule>({
    recurrence: Recurrence.Daily,
    time: '00:00',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(event.target.value);
    setError('');
  };

  const handleSave = async () => {
    if (!agentName.trim()) {
      setError('Please enter a name for the integration agent');
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a new integration agent with tasks and schedule
      const newAgent = {
        name: agentName,
        code: agentName.toLowerCase().replace(/\s+/g, '_'),
        type: "Process",
        enabled: true,
        updates_available: false,
        tasks: tasks,
        schedule: schedule
      };
      
      const createdAgent = await createIntegrationAgent(newAgent);
      navigate(`/integrationagents/${createdAgent.id}`);
    } catch (error) {
      console.error('Failed to create integration agent:', error);
      setError('Failed to create integration agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskAdd = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleTaskUpdate = (taskId: number, updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleScheduleUpdate = (updatedSchedule: ProcessSchedule) => {
    setSchedule(updatedSchedule);
  };

  return (
    <div className="p-6">
      {/* Header section */}
      <header className="mb-6">
        <Link 
          to="/integrationagents" 
          className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
          aria-label="Back to Agents"
        >
          <ArrowBackIcon className="mr-1" size="sm" />
          <span>Back to Agents</span>
        </Link>
      </header>
      
      <div className="flex flex-col mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Create New Integration</h1>
          
          <div className="flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={agentName}
                onChange={handleNameChange}
                placeholder="Enter Integration Agent Name"
                className="form-input mr-2"
                aria-label="Integration Agent Name"
                aria-required="true"
                aria-invalid={!!error}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1 absolute">{error}</p>
              )}
            </div>
            
            <button
              className={`btn-primary flex items-center justify-center ${
                !agentName.trim() || isSaving 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={handleSave}
              disabled={isSaving || !agentName.trim()}
              aria-label="Save Agent"
            >
              <SaveIcon className="mr-1" size="sm" />
              <span>Save</span>
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Create a new integration agent by configuring the trigger and adding workflow tasks. Design your integration flow from left to right.
          </p>
        </div>
      </div>
      
      <div className="mb-2 text-right">
        <span className="text-indigo-600 text-sm font-medium">Workflow Builder</span>
      </div>
      
      {/* Canvas Component */}
      <Canvas
        agentId={0}
        tasks={tasks}
        schedule={schedule}
        onTaskAdd={handleTaskAdd}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onScheduleUpdate={handleScheduleUpdate}
      />
    </div>
  );
};

export default NewIntegrationAgentPage; 
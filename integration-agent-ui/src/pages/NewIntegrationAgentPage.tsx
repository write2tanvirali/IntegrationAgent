import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from '@mui/icons-material';
import Canvas from '../components/Canvas/Canvas';
import { createIntegrationAgent } from '../services/api';
import { Task, ProcessSchedule, Recurrence } from '../types';
import { Link } from 'react-router-dom';

const NewIntegrationAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ProcessSchedule>({
    recurrence: Recurrence.Daily,
    time: '00:00',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(event.target.value);
  };

  const handleSave = async () => {
    if (!agentName.trim()) {
      alert('Please enter a name for the integration agent');
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
      alert('Failed to create integration agent. Please try again.');
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
    <div className="p-4">
      {/* Simple header section that matches the screenshot */}
      <div className="mb-4">
        <Link to="/integrationagents" className="text-purple-700 hover:text-purple-900 mb-2 flex items-center">
          <span className="mr-1">←</span>
          <span>Back to Agents</span>
        </Link>
      </div>
      
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Action</span>
          
          <div className="flex items-center">
            <input
              type="text"
              value={agentName}
              onChange={handleNameChange}
              placeholder="Enter Integration Agent Name"
              className="border p-2 rounded mr-2 w-64"
            />
            
            <button
              className="bg-gray-200 p-2 rounded"
              onClick={handleSave}
              disabled={isSaving || !agentName.trim()}
              title="Save Agent"
            >
              <Save />
            </button>
          </div>
        </div>
        
        <div className="mb-2">
          <h3 className="text-lg font-bold mb-1">Task 1</h3>
          <p className="text-sm text-gray-600">
            Create a new integration agent by configuring the trigger and adding workflow tasks. Design your integration flow from left to right.
          </p>
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-gray-500 text-sm float-right">Workflow Builder</span>
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
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Canvas from '../components/Canvas/Canvas';
import {
  fetchIntegrationAgent,
  updateIntegrationAgent,
  saveIntegrationProcess,
  saveProcessSchedule,
  saveTaskConnectorConfig,
  createProcessTask,
  updateProcessTask,
  deleteIntegrationAgent,
} from '../services/api';
import { IntegrationAgent, Task, ProcessSchedule, IntegrationProcess, TaskType, ConnectorType } from '../types';
import TaskFormModal from '../components/TaskFormModal';

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
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<IntegrationAgent | null>(null);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processes, setProcesses] = useState<IntegrationProcess[]>([]);
  const [error, setError] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Determine the primary process ID (assuming the first process)
  const processId = processes[0]?.id?.toString();

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) return;
      
      setIsLoading(true);
      try {
        const data = await fetchIntegrationAgent(agentId);
        setAgent(data);
        setName(data.name);
        
        // If the agent has processes, load them and set tasks from the first process
        if (data.processes && data.processes.length > 0) {
          setProcesses(data.processes);
          setTasks(data.processes[0].tasks || []); // Initialize tasks from the first process
        } else {
          // Handle case where agent might have tasks directly (fallback)
          setTasks(data.tasks || []);
          setProcesses([]); // Ensure processes is empty if not found
        }
      } catch (err) {
        console.error('Failed to fetch agent:', err);
        setError('Failed to load integration agent');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!agent) return;
    
    try {
      setIsSaving(true);
      
      // Update the agent name
      const updatedAgent = await updateIntegrationAgent(
        agent.id.toString(), 
        { ...agent, name }
      );
      setAgent(updatedAgent);
      
      // Save all processes associated with this agent
      if (processes.length > 0) {
        const savedProcesses = await Promise.all(
          processes.map(process => saveIntegrationProcess(agent.id.toString(), process))
        );
        
        // Update the processes state with the saved processes
        setProcesses(savedProcesses);
      }
      
      // Save the schedule if it exists
      if (agent.schedule) {
        const savedSchedule = await saveProcessSchedule(agent.id.toString(), agent.schedule);
        
        // Update the agent with the saved schedule
        setAgent((prev: IntegrationAgent | null) => prev ? { ...prev, schedule: savedSchedule } : null);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update agent:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskAdd = async (task: Task) => {
    if (!agent) return;
    
    try {
      const updatedAgent = { ...agent };
      updatedAgent.tasks = [...agent.tasks, task];
      
      setAgent(updatedAgent);
      await updateIntegrationAgent(agent.id.toString(), updatedAgent);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleTaskUpdate = async (taskId: number, updatedTask: Task) => {
    if (!agent) return;
    
    try {
      // Find the process that contains this task
      const processIndex = processes.findIndex(process => 
        process.tasks.some((task: Task) => task.id === taskId)
      );
      
      if (processIndex !== -1) {
        // Update the task in the process
        const updatedProcess = {
          ...processes[processIndex],
          tasks: processes[processIndex].tasks.map((task: Task) => 
            task.id === taskId ? updatedTask : task
          ),
          updatedAt: new Date().toISOString()
        };
        
        // Save the updated process
        const savedProcess = await saveIntegrationProcess(agent.id.toString(), updatedProcess);
        
        // Update the processes state
        const newProcesses = [...processes];
        newProcesses[processIndex] = savedProcess;
        setProcesses(newProcesses);
      }
      
      // Update the task in the agent
      const updatedTasks = agent.tasks.map((task: Task) => 
        task.id === taskId ? updatedTask : task
      );
      
      const updatedAgent = {
        ...agent,
        tasks: updatedTasks
      };
      
      setAgent(updatedAgent);
      await updateIntegrationAgent(agent.id.toString(), updatedAgent);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!agent) return;
    
    try {
      // Find the process that contains this task
      const processIndex = processes.findIndex(process => 
        process.tasks.some((task: Task) => task.id === taskId)
      );
      
      if (processIndex !== -1) {
        // Remove the task from the process
        const updatedProcess = {
          ...processes[processIndex],
          tasks: processes[processIndex].tasks.filter((task: Task) => task.id !== taskId),
          updatedAt: new Date().toISOString()
        };
        
        // If the process still has tasks, update it; otherwise, remove it
        if (updatedProcess.tasks.length > 0) {
          const savedProcess = await saveIntegrationProcess(agent.id.toString(), updatedProcess);
          
          // Update the processes state
          const newProcesses = [...processes];
          newProcesses[processIndex] = savedProcess;
          setProcesses(newProcesses);
        } else {
          // Remove the process if it has no tasks
          // Note: You would need to implement a deleteIntegrationProcess API function
          // await deleteIntegrationProcess(agent.id, processes[processIndex].id);
          
          // Update the processes state
          setProcesses(processes.filter((_, index) => index !== processIndex));
        }
      }
      
      // Update the agent by removing the task
      const updatedTasks = agent.tasks.filter((task: Task) => task.id !== taskId);
      
      const updatedAgent = {
        ...agent,
        tasks: updatedTasks
      };
      
      setAgent(updatedAgent);
      await updateIntegrationAgent(agent.id.toString(), updatedAgent);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleScheduleUpdate = async (schedule: ProcessSchedule) => {
    if (!agent) return;
    
    try {
      // Save the schedule to the database
      const savedSchedule = await saveProcessSchedule(agent.id.toString(), schedule);
      
      // Update the agent with the new schedule
      const updatedAgent = {
        ...agent,
        schedule: savedSchedule
      };
      
      setAgent(updatedAgent);
      await updateIntegrationAgent(agent.id.toString(), updatedAgent);
    } catch (err) {
      console.error('Failed to update schedule:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    if (isTaskModalOpen) {
      console.log("Modal already open, ignoring additional open request");
      return;
    }
    
    console.log("Opening task form modal with task:", task);
    setCurrentTask({ ...task });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (updatedTaskData: Task) => {
    console.log("IntegrationAgentDetailsPage - handleSaveTask called with:", updatedTaskData);
    
    // Immediately close the modal to prevent any re-opens
    setIsTaskModalOpen(false);
    setCurrentTask(null);
    console.log("Modal closed immediately");
    
    setIsSaving(true);
    setError('');
    
    // Now handle the API calls and state updates
    try {
      let savedTask: Task;
      
      console.log("IntegrationAgentDetailsPage - Starting task save...");
      
      if (updatedTaskData.id) {
        console.log(`IntegrationAgentDetailsPage - Updating existing task ${updatedTaskData.id}`);
        savedTask = await updateProcessTask(updatedTaskData.id, updatedTaskData);
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === savedTask.id ? savedTask : t)
        );
      } else {
        console.log("IntegrationAgentDetailsPage - Creating new task");
        if (!processId) {
          throw new Error("Process ID is missing, cannot create task.");
        }
        savedTask = await createProcessTask(updatedTaskData, parseInt(processId));
        setTasks(prevTasks => [...prevTasks, savedTask]);
      }

      console.log("IntegrationAgentDetailsPage - Task saved, checking for connector config");
      
      // --- Save Connector Config ---
      if (savedTask.id && updatedTaskData.connector_type && updatedTaskData.connector_config) {
        try {
          console.log('--- Attempting to Save Connector Config ---');
          console.log('Task ID:', savedTask.id);
          console.log('Connector Type:', updatedTaskData.connector_type);
          console.log('Connector Config Payload:', JSON.stringify(updatedTaskData.connector_config, null, 2));

          await saveTaskConnectorConfig(
            savedTask.id,
            updatedTaskData.connector_type as ConnectorType,
            updatedTaskData.connector_config
          );
          console.log(`Connector config API call finished for task ${savedTask.id}`);

        } catch (configError) {
          console.error("Failed to save connector configuration:", configError);
          setError(`Task saved, but failed to save connector configuration. Please edit the task to try again.`);
        }
      } else {
         console.log('--- Skipping Connector Config Save ---');
         console.log('Saved Task ID:', savedTask.id);
         console.log('Has Connector Type:', !!updatedTaskData.connector_type);
         console.log('Has Connector Config:', !!updatedTaskData.connector_config);
      }
      
      console.log("IntegrationAgentDetailsPage - Save complete");

    } catch (err) {
      console.error('Failed to save task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for updates originating from the Canvas (e.g., position change)
  const handleCanvasTaskUpdate = async (taskId: number, updatedTaskData: Task) => {
    // Optimistically update local state for smoother UI
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === taskId ? updatedTaskData : t))
    );

    // Persist the change to the backend
    try {
      // We only need to send partial updates, especially for position
      // Ensure the API function handles partial updates correctly
      await updateProcessTask(taskId, { position: updatedTaskData.position });
      console.log(`Task ${taskId} position updated successfully.`);
      // Optionally re-fetch or update state with the response if needed
    } catch (err) {
      console.error(`Failed to update task ${taskId} position:`, err);
      setError(`Failed to save position for task ${updatedTaskData.name}.`);
      // Optionally revert the optimistic update here if the API call fails
      // setTasks(prevTasks => /* revert logic */);
    }
  };

  const handleDeleteAgent = async () => {
    try {
      if (!agent) return;
      
      setIsSaving(true);
      await deleteIntegrationAgent(agent.id.toString());
      navigate('/integrationagents');
    } catch (error) {
      console.error('Failed to delete agent:', error);
      setError('Failed to delete integration agent. Please try again.');
    } finally {
      setIsSaving(false);
      setIsDeleteModalOpen(false);
    }
  };

  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this integration agent? 
            This action cannot be undone and will delete all associated processes, tasks, and schedules.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAgent}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
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
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-row items-center justify-between w-full mb-4">
          <Link to="/integrationagents" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to Agents</span>
          </Link>
          
          <div className="flex items-center">
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="text-2xl font-bold border-b-2 border-transparent focus:border-indigo-500 focus:outline-none bg-transparent pr-10 py-1 transition-colors"
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
          tasks={tasks}
          schedule={agent.schedule}
          processId={processId ? parseInt(processId) : undefined}
          onTaskAdd={() => { /* Open modal for new task */ handleEditTask({ name: '', type: TaskType.INPUT /* default */ }); }}
          onTaskUpdate={handleCanvasTaskUpdate}
          onTaskDelete={(taskId) => { /* Implement direct delete API call + state update */ console.log('Delete task', taskId); }}
          onScheduleUpdate={handleScheduleUpdate}
          onEditTask={handleEditTask}
        />
      )}

      {isTaskModalOpen && currentTask && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          task={currentTask || { name: '', type: TaskType.INPUT /* default */ }}
          onSave={handleSaveTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setCurrentTask(null);
          }}
        />
      )}

      <DeleteConfirmationModal />
    </div>
  );
};

export default IntegrationAgentDetailsPage; 
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SaveIcon, ArrowBackIcon } from '../components/Icons';
import Canvas from '../components/Canvas/Canvas';
import TaskFormModal from '../components/TaskFormModal';
import { Task, ProcessSchedule, Recurrence, TaskType, LogicType, ConnectorType, TriggerType } from '../types';
import { createIntegrationAgent, saveProcessSchedule, saveIntegrationProcess, createProcessTask, saveTaskConnectorConfig } from '../services/api';

const NewIntegrationAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ProcessSchedule>({
    enabled: true,
    recurrence: Recurrence.DAILY,
    time: '00:00',
    daysOfWeek: [],
    daysOfMonth: [],
    months: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    updatedAt: new Date().toISOString()
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Add this flag to track when a task was just added
  const [justAddedTask, setJustAddedTask] = useState(false);

  // Add a ref to track the last time the modal was closed
  const lastModalCloseTime = useRef<number>(0);

  // Add a state flag to completely block modal opens
  const [isModalLocked, setIsModalLocked] = useState(false);

  // Add a more robust modal lock that prevents ANY modal from opening for 2 seconds after save
  const [isHardLocked, setIsHardLocked] = useState(false);

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
      
      // 1. Create the integration agent (IntegrationAgentCreate)
      const newAgent = {
        name: agentName,
        code: agentName.toLowerCase().replace(/\s+/g, '_'),
        type: "Process", // Using string directly, could use an enum if defined
        enabled: true,
        updates_available: false
      };
      
      const createdAgent = await createIntegrationAgent(newAgent);
      
      // 2. Create an integration process for the agent (IntegrationProcessCreate)
      const process = await saveIntegrationProcess(createdAgent.id.toString(), {
        name: `${agentName} Process`,
        description: `Process for ${agentName}`,
        auto_start: false,
        trigger_type: TriggerType.SCHEDULER,
        status: "Stopped"
      });
      
      // 3. Create tasks for the process (ProcessTaskCreate)
      if (tasks.length > 0) {
        const taskPromises = tasks.map(task => 
          createProcessTask({
            name: task.name,
            type: task.type,
            description: `Task for ${task.name}`,
            sequence_number: task.sequence_number,
            enabled: true,
            input_source: task.input_source,
            input: task.input,
            save_input: task.save_input,
            logic_type: task.logic_type,
            response: task.response,
            connector_type: mapToConnectorType(task.type),
            position: task.position
          }, process.id)
        );

        await Promise.all(taskPromises);
      }
      
      // 4. Create schedule for the process (ProcessScheduleCreate)
      if (schedule) {
        await saveProcessSchedule(process.id.toString(), schedule);
      }
      
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

  const handleEditTask = (task: Task) => {
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[existingIndex] = task;
      setTasks(updatedTasks);
    }
  };

  // Define a function to calculate the initial position of a new task
  const getInitialTaskPosition = (taskIndex: number) => {
    // Calculate position based on taskIndex to create a nice visual arrangement
    // Start from the left side with some padding and space tasks horizontally
    const xOffset = 150 + (taskIndex % 3) * 250; // 3 columns with 250px spacing
    const yOffset = 150 + Math.floor(taskIndex / 3) * 150; // Rows with 150px spacing
    
    return { x: xOffset, y: yOffset };
  };

  // Modified function to close the modal with a HARD lock
  const closeTaskModal = () => {
    // Close the modal
    setIsTaskModalOpen(false);
    setCurrentTask(null);
    console.log("Modal closed, applying HARD lock for 2 seconds");
    
    // Apply a hard lock for 2 seconds - much longer than the state update cycle
    setIsModalLocked(true);
    setIsHardLocked(true);
    
    // After 2 seconds, release both locks
    setTimeout(() => {
      console.log("All modal locks released");
      setIsModalLocked(false);
      setIsHardLocked(false);
    }, 2000);
  };

  const handleSaveTask = (task: Task) => {
    console.log("NewIntegrationAgentPage - handleSaveTask called with:", task);
    
    // Close the modal safely
    closeTaskModal();
    
    // Generate a temporary ID for the new task
    const tempTask = {
      ...task,
      id: task.id || -1 * (tasks.length + 1),
      position: task.position || getInitialTaskPosition(tasks.length),
      // Make sure we're explicitly keeping the connector configuration
      connector_type: task.connector_type,
      connector_config: task.connector_config
    };
    
    // Add task to local state
    setTasks(prevTasks => [...prevTasks, tempTask]);
    
    console.log("Task added to local state with connector config:", tempTask);
  };

  const handleEditTaskLocal = (taskId: number, updatedTask: Task) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? updatedTask : task
    ));
  };

  const handleDeleteTaskLocal = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleOpenTaskModal = (task?: Task) => {
    // If modal is already open OR the lock is active, ignore this request
    if (isTaskModalOpen || isModalLocked) {
      console.log("Ignoring modal open request - locked or already open", {
        isOpen: isTaskModalOpen,
        isLocked: isModalLocked
      });
      return;
    }
    
    console.log("Opening task modal with:", task);
    setCurrentTask(task || { name: '', type: TaskType.INPUT });
    setIsTaskModalOpen(true);
  };

  const mapToConnectorType = (taskType: string): ConnectorType | undefined => {
    switch (taskType) {
      case TaskType.INPUT:
        return ConnectorType.WEB_SERVICE;
      case TaskType.OUTPUT:
        return ConnectorType.EMAIL;
      default:
        return undefined;
    }
  };

  const handleSaveAgent = async () => {
    if (!agentName.trim()) {
      setError('Agent name is required.');
      return;
    }
    setIsSaving(true);
    setError('');

    try {
      // DEBUGGING: Log all tasks with their connector information
      console.log("START AGENT SAVE - All tasks:", tasks);
      console.log("Tasks with connector config:", tasks.filter(t => t.connector_type));
      tasks.forEach((task, index) => {
        console.log(`Task ${index}: ${task.name}`, {
          id: task.id,
          type: task.type,
          hasConnectorType: !!task.connector_type,
          connectorType: task.connector_type,
          hasConnectorConfig: !!task.connector_config,
          connectorConfigKeys: task.connector_config ? Object.keys(task.connector_config) : []
        });
      });

      const newAgent = await createIntegrationAgent({
        name: agentName,
        type: 'Process',
        enabled: true,
      });

      const newProcess = await saveIntegrationProcess(newAgent.id.toString(), {
        name: `${agentName} Process`,
        trigger_type: TriggerType.SCHEDULER,
      });

      await saveProcessSchedule(newProcess.id.toString(), schedule);

      // Save all tasks first and track the mapping of temp IDs to real IDs
      const savedTasksMap = new Map();
      
      // Step 1: Save all tasks first
      for (const task of tasks) {
        console.log(`Saving task ${task.name}:`, {
          id: task.id,
          connectorType: task.connector_type,
          connectorConfig: task.connector_config
        });
        
        try {
          // For new tasks, remove any temporary ID
          const { id: tempId, ...taskToCreate } = task;
          
          // DETAILED LOGGING - Task data before API call
          console.log(`TASK API CALL - About to create process task for "${task.name}"`, {
            taskData: taskToCreate,
            processId: newProcess.id,
            taskFields: Object.keys(taskToCreate),
            hasConnector: !!task.connector_type,
            connectorType: task.connector_type,
            hasConnectorConfig: !!task.connector_config,
            apiEndpoint: `/process-tasks/` // Log the endpoint
          });
          
          // Save the task
          const savedTask = await createProcessTask(taskToCreate, newProcess.id);
          
          // DETAILED LOGGING - Task saved successfully
          console.log(`TASK API CALL - Task "${task.name}" saved successfully`, {
            savedTaskId: savedTask.id,
            savedTaskData: savedTask,
            responseFields: Object.keys(savedTask)
          });
          
          // Store mapping of temp ID to saved task
          savedTasksMap.set(task.id, savedTask);
          
          // IMPORTANT: Save connector config immediately after each task
          if (task.connector_type && task.connector_config) {
            // DETAILED LOGGING - Connector data before API call
            console.log(`CONNECTOR API CALL - About to save connector for task "${savedTask.name}"`, {
              taskId: savedTask.id,
              connectorType: task.connector_type,
              connectorConfig: task.connector_config,
              configFields: Object.keys(task.connector_config),
              apiEndpoint: `/connectors/` // Log the endpoint
            });
            
            // Add null check for savedTask.id
            if (savedTask.id) {
              try {
                const connectorResult = await saveTaskConnectorConfig(
                  savedTask.id,
                  task.connector_type as ConnectorType,
                  task.connector_config
                );
                
                // DETAILED LOGGING - Connector saved successfully
                console.log(`CONNECTOR API CALL - Connector saved for task "${savedTask.name}"`, {
                  response: connectorResult,
                  responseFields: connectorResult ? Object.keys(connectorResult) : []
                });
              } catch (connectorError) {
                console.error(`CONNECTOR API ERROR - Failed to save connector for task "${savedTask.name}":`, connectorError);
                setError(prev => `${prev} Failed to save connector for ${savedTask.name}.`);
              }
            } else {
              console.error(`CONNECTOR API ERROR - Cannot save connector: Task "${savedTask.name}" has no ID`);
              setError(prev => `${prev} Cannot save connector for ${savedTask.name} (missing ID).`);
            }
          } else {
            console.log(`No connector to save for task "${task.name}" - missing type or config`);
          }
        } catch (taskError) {
          console.error(`TASK API ERROR - Failed to save task "${task.name}":`, taskError);
          setError(`Failed to save task ${task.name}.`);
        }
      }

      console.log('Agent, process, schedule, and tasks saved successfully');
      navigate(`/integration-agents/${newAgent.id}`);

    } catch (err) {
      console.error('Failed to save agent:', err);
      setError('Failed to save integration agent.');
    } finally {
      setIsSaving(false);
    }
  };

  // Completely block Canvas onTaskAdd during hard lock period
  const handleCanvasTaskAdd = () => {
    if (isHardLocked) {
      console.log("BLOCKED: Canvas tried to open task modal during hard lock period");
      return;
    }
    
    handleOpenTaskModal();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex items-center">
            <Link 
              to="/integrationagents" 
              className="text-indigo-600 hover:text-indigo-800 flex items-center mr-3"
              aria-label="Back to Agents"
            >
              <ArrowBackIcon className="mr-1" size="sm" />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Create New Integration</h1>
          </div>
          
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
            <div className="w-4"></div>
            <button
              className={`btn-primary flex items-center justify-center ${
                !agentName.trim() || isSaving 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={handleSaveAgent}
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
       
      <Canvas
        agentId={0}
        tasks={tasks}
        schedule={schedule}
        onTaskAdd={handleCanvasTaskAdd}
        onTaskUpdate={(taskId, task) => handleEditTaskLocal(taskId, task)}
        onTaskDelete={handleDeleteTaskLocal}
        onScheduleUpdate={handleScheduleUpdate}
        onEditTask={handleOpenTaskModal}
      />

      {isTaskModalOpen && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          task={currentTask || { name: '', type: TaskType.INPUT }}
          onSave={handleSaveTask}
          onClose={closeTaskModal}
        />
      )}
    </div>
  );
};

export default NewIntegrationAgentPage;
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ProcessSchedule, IntegrationAgent, IntegrationProcess, Recurrence, Task, TriggerType, TaskType, ConnectorType, ConnectorConfig } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Example function to register a user
export const registerUser = async (username: string, password: string) => {
  try {
    const response = await api.post('/user/register', { username, password });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Example function to login a user
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post('/user/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Example function to fetch integration agents
export const fetchIntegrationAgents = async () => {
  try {
    const response = await api.get('/integration-agents/');
    return response.data;
  } catch (error) {
    console.error('Error fetching integration agents:', error);
    throw error;
  }
};

// Example function to create a new integration agent
export const createIntegrationAgent = async (agent: Partial<IntegrationAgent>): Promise<IntegrationAgent> => {
  try {
    // Convert to the format expected by the API (IntegrationAgentCreate)
    const agentData = {
      name: agent.name,
      code: agent.code || agent.name?.toLowerCase().replace(/\s+/g, '_'),
      type: agent.type,
      enabled: agent.enabled !== undefined ? agent.enabled : true,
      updates_available: agent.updates_available !== undefined ? agent.updates_available : false
    };
    
    const response = await api.post('/integration-agents/', agentData);
    return response.data;
  } catch (error) {
    console.error('Error creating integration agent:', error);
    throw error;
  }
};

// Add more functions for update and delete operations as needed

export const fetchIntegrationAgent = async (id: string): Promise<IntegrationAgent> => {
  try {
    const response = await api.get(`/integration-agents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching integration agent:', error);
    throw error;
  }
};

export const updateIntegrationAgent = async (id: string, agent: Partial<IntegrationAgent>): Promise<IntegrationAgent> => {
  try {
    // Convert to the format expected by the API
    const agentData = {
      name: agent.name,
      code: agent.code || agent.name?.toLowerCase().replace(/\s+/g, '_'),
      type: agent.type,
      enabled: agent.enabled !== undefined ? agent.enabled : true,
      updates_available: agent.updates_available !== undefined ? agent.updates_available : false
    };
    
    const response = await api.put(`/integration-agents/${id}`, agentData);
    return response.data;
  } catch (error) {
    console.error('Error updating integration agent:', error);
    throw error;
  }
};

/**
 * Saves an integration process to the database
 */
export const saveIntegrationProcess = async (agentId: string, process: Partial<IntegrationProcess>): Promise<IntegrationProcess> => {
  try {
    // Convert to the format expected by the API (IntegrationProcessCreate)
    const processData = {
      integration_agent_id: parseInt(agentId),
      name: process.name,
      description: process.description || null,
      auto_start: process.auto_start || false,
      trigger_type: process.trigger_type || TriggerType.SCHEDULER,
      status: process.status || "Stopped"
    };
    
    const response = await api.post('/integration-processes/', processData);
    return response.data;
  } catch (error) {
    console.error('Error saving integration process:', error);
    throw error;
  }
};

/**
 * Saves a process schedule to the database
 */
export const saveProcessSchedule = async (processId: string, schedule: ProcessSchedule): Promise<ProcessSchedule> => {
  try {
    // Convert to the format expected by the API (ProcessScheduleCreate)
    const scheduleData = {
      integration_process_id: parseInt(processId),
      recurrence_type: schedule.recurrence,
      start_date: schedule.startDate || new Date().toISOString().split('T')[0],
      enabled: schedule.enabled !== undefined ? schedule.enabled : true,
      interval_minutes: schedule.recurrence === Recurrence.INTERVAL ? 60 : 0,
      day_of_week: schedule.recurrence === Recurrence.WEEKLY && schedule.daysOfWeek?.length 
        ? getDayOfWeekNumber(schedule.daysOfWeek[0]) 
        : 0,
      day_of_month: schedule.recurrence === Recurrence.MONTHLY && schedule.daysOfMonth?.length 
        ? schedule.daysOfMonth[0] 
        : 0,
      month: schedule.recurrence === Recurrence.YEARLY && schedule.months?.length 
        ? getMonthNumber(schedule.months[0]) 
        : 0,
      hour: schedule.time ? parseInt(schedule.time.split(':')[0]) : 0,
      minute: schedule.time ? parseInt(schedule.time.split(':')[1]) : 0
    };
    
    const response = await api.post(`/integration-processes/${processId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error saving process schedule:', error);
    throw error;
  }
};

// Add function to fetch all processes for an agent
export const fetchIntegrationProcesses = async (agentId: string): Promise<IntegrationProcess[]> => {
  try {
    const response = await api.get('/integration-processes/', {
      params: { agent_id: parseInt(agentId) }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching integration processes:', error);
    throw error;
  }
};

// Add function to delete a process
export const deleteIntegrationProcess = async (processId: string): Promise<void> => {
  try {
    await api.delete(`/integration-processes/${processId}`);
  } catch (error) {
    console.error('Error deleting integration process:', error);
    throw error;
  }
};

// Helper function to map frontend TaskType to backend enum string (adjust if needed)
const mapTaskType = (type: string | undefined): string | null => {
  if (!type) return null;
  // Assuming backend expects the enum keys like 'Input', 'Output', 'Logic'
  return Object.values(TaskType).includes(type as TaskType) ? type : null;
};

// Add function to fetch a process schedule
export const fetchProcessSchedule = async (processId: string): Promise<ProcessSchedule> => {
  try {
    const response = await api.get(`/integration-processes/${processId}/schedule`);
    return response.data;
  } catch (error) {
    console.error('Error fetching process schedule:', error);
    throw error;
  }
};

// Helper function to convert day name to number
const getDayOfWeekNumber = (day: string): number => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(day);
};

// Helper function to convert month name to number
const getMonthNumber = (month: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(month) + 1; // API might expect 1-12 instead of 0-11
};

// --- Update Task Function ---
// Assuming taskId is the ID of the task itself, and processId might be implicit or passed differently
export const updateProcessTask = async (taskId: number, task: Partial<Task>): Promise<Task> => {
  try {
    // Convert to the format expected by the API
    const taskData = {
      task_name: task.name,
      description: task.description || null,
      type: mapTaskType(task.type),
      sequence_number: task.sequence_number,
      enabled: task.enabled,
      input_source: task.input_source || null,
      input: task.input || null,
      save_input: task.save_input,
      logic_type: task.logic_type || null,
      response: task.response || null,
      connector_type: task.connector_type || null,
      option_type: task.option_type || "None",
      conditions: task.conditions || null,
      position_x: task.position?.x,
      position_y: task.position?.y,
    };

    // Filter out undefined values if the backend doesn't like them
    const filteredTaskData = Object.fromEntries(
      Object.entries(taskData).filter(([_, v]) => v !== undefined)
    );

    const response = await api.put(`/process-tasks/${taskId}`, filteredTaskData);
    return response.data;
  } catch (error) {
    console.error('Error updating process task:', error);
    throw error;
  }
};

// --- Create Task Function ---
// Assuming processId is passed separately
export const createProcessTask = async (task: Omit<Task, 'id'>, processId: number): Promise<Task> => {
  try {
    // Convert to the format expected by the API
     const taskData = {
      integration_process_id: processId,
      task_name: task.name,
      description: task.description || null,
      type: mapTaskType(task.type),
      sequence_number: task.sequence_number,
      enabled: task.enabled,
      input_source: task.input_source || null,
      input: task.input || null,
      save_input: task.save_input,
      logic_type: task.logic_type || null,
      response: task.response || null,
      connector_type: task.connector_type || null,
      option_type: task.option_type || "None",
      conditions: task.conditions || null,
      position_x: task.position?.x,
      position_y: task.position?.y,
    };

    // Filter out undefined values
    const filteredTaskData = Object.fromEntries(
      Object.entries(taskData).filter(([_, v]) => v !== undefined)
    );

    console.log(`API SERVICE - createProcessTask - Sending request to /process-tasks/`, {
      requestData: filteredTaskData,
      processId: processId
    });

    const response = await api.post(`/process-tasks/`, filteredTaskData);
    console.log(`API SERVICE - createProcessTask - Response received:`, response.data);

    return response.data;
  } catch (error) {
    console.error('API SERVICE - createProcessTask - Error creating process task:', error);
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      console.error("API Error Headers:", error.response?.headers);
    }
    throw error;
  }
};

/**
 * Saves the connector configuration for a specific task using the /connectors/ endpoint.
 */
export const saveTaskConnectorConfig = async (
  taskId: number,
  connectorType: ConnectorType,
  connectorConfig: any
): Promise<any> => {
  console.log(`API SERVICE - saveTaskConnectorConfig - Called for task ${taskId}`, {
    taskId,
    connectorType,
    connectorConfig,
    configKeys: Object.keys(connectorConfig || {})
  });
  
  try {
    // Structure the payload exactly as the backend expects
    const payload = {
      process_task_id: taskId,
      data_type: "Single",
      connector_type: connectorType,
      config: connectorConfig  // Keep the config as a nested object instead of spreading
    };
    
    console.log(`API SERVICE - saveTaskConnectorConfig - Sending payload to /connectors/`, {
      fullPayload: payload,
      stringifiedPayload: JSON.stringify(payload)
    });
    
    const response = await api.post(`/connectors/`, payload);
    
    console.log("API SERVICE - saveTaskConnectorConfig - Connector config saved successfully:", {
      response: response.data,
      status: response.status
    });
    return response.data;
  } catch (error) {
    console.error("API SERVICE - saveTaskConnectorConfig - Error:", error);
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      console.error("Request Payload:", error.config?.data);
    }
    throw error;
  }
};

/**
 * Deletes an integration agent by ID
 * @param agentId The ID of the integration agent to delete
 */
export const deleteIntegrationAgent = async (agentId: string): Promise<void> => {
  try {
    console.log(`API SERVICE - deleteIntegrationAgent - Deleting agent ${agentId}`);
    const response = await api.delete(`/integration-agents/${agentId}`);
    console.log(`API SERVICE - deleteIntegrationAgent - Success:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`API SERVICE - deleteIntegrationAgent - Error deleting agent ${agentId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
    }
    throw error;
  }
};

export default api; 
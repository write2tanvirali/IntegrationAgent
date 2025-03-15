import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ProcessSchedule, IntegrationAgent } from '../types';

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
  const response = await api.get('/integration_agents');
  return response.data;
};

// Example function to create a new integration agent
export const createIntegrationAgent = async (agentData: any) => {
  const response = await api.post('/integration_agents', agentData);
  return response.data;
};

// Add more functions for update and delete operations as needed

export const fetchIntegrationAgent = async (id: number) => {
  const response = await api.get(`/integration_agents/${id}`);
  return response.data;
};

export const updateIntegrationAgent = async (id: number, data: Partial<IntegrationAgent>) => {
  const response = await api.put(`/integration_agents/${id}`, data);
  return response.data;
};

export default api; 
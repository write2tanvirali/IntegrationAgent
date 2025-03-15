import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchIntegrationAgents } from '../services/api';
import { Agent } from '../types/agent';

interface AgentsState {
  agents: Agent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  status: 'idle',
  error: null,
};

export const fetchAgents = createAsyncThunk('agents/fetchAgents', async () => {
  const response = await fetchIntegrationAgents();
  return response;
});

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch agents';
      });
  },
});

export default agentsSlice.reducer;

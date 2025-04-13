// src/store/slices/logsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LogEntry, LogQueryOptions } from '../../database/models/logModels';
import { LogService } from '../../database/services/logService';

interface LogsState {
  logs: LogEntry[];
  totalLogs: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  queryOptions: LogQueryOptions;
}

const initialState: LogsState = {
  logs: [],
  totalLogs: 0,
  status: 'idle',
  error: null,
  queryOptions: {
    limit: 50,
    sort: 'desc',
  },
};

export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (options: LogQueryOptions, { rejectWithValue }) => {
    try {
      const logs = await LogService.queryLogs(options);
      
      // Get total logs for pagination
      const allLogsOptions = { ...options };
      delete allLogsOptions.limit;
      delete allLogsOptions.offset;
      const allLogs = await LogService.queryLogs(allLogsOptions);
      
      return {
        logs,
        totalLogs: allLogs.length,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markErrorFixed = createAsyncThunk(
  'logs/markErrorFixed',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      await LogService.markErrorAsFixed(id);
      
      // Refresh logs with current query options
      const state = getState() as { logs: LogsState };
      dispatch(fetchLogs(state.logs.queryOptions));
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportLogs = createAsyncThunk(
  'logs/exportLogs',
  async ({ 
    format, 
    options 
  }: { 
    format: 'json' | 'markdown', 
    options: LogQueryOptions 
  }, { rejectWithValue }) => {
    try {
      if (format === 'json') {
        return await LogService.exportLogsToJson(options);
      } else {
        return await LogService.exportLogsToMarkdown(options);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setQueryOptions(state, action) {
      state.queryOptions = {
        ...state.queryOptions,
        ...action.payload,
      };
    },
    clearLogs(state) {
      state.logs = [];
      state.totalLogs = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.logs = action.payload.logs;
        state.totalLogs = action.payload.totalLogs;
        state.error = null;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(markErrorFixed.fulfilled, (state, action) => {
        // Individual log update handled by refresh via fetchLogs in the thunk
      });
  },
});

export const { setQueryOptions, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
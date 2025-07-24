import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const AppContext = createContext();

const initialState = {
  config: {
    url: 'https://landing-dukkecord.andres-duque.com/',
    visits: 50,
    monitor1Width: 1920,
    monitor2PositionX: 2020,
    monitor2PositionY: 50,
    minDelay: 3000,
    maxDelay: 7000,
    minWaitBetween: 1000,
    maxWaitBetween: 3000,
    headless: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  status: {
    isRunning: false,
    isPaused: false,
    currentVisit: 0,
    totalVisits: 0,
    progress: 0,
    stats: { successful: 0, errors: 0, totalTime: 0 },
    estimatedTimeRemaining: null,
    startTime: null
  },
  logs: [],
  socket: null,
  connected: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'ADD_LOG':
      return { 
        ...state, 
        logs: [...state.logs, action.payload].slice(-1000) // Keep last 1000 logs
      };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    dispatch({ type: 'SET_SOCKET', payload: socket });

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('status', (status) => {
      dispatch({ type: 'SET_STATUS', payload: status });
    });

    socket.on('config', (config) => {
      dispatch({ type: 'SET_CONFIG', payload: config });
    });

    socket.on('log', (log) => {
      dispatch({ type: 'ADD_LOG', payload: log });
    });

    socket.on('logs', (logs) => {
      dispatch({ type: 'SET_LOGS', payload: logs });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const api = {
    async updateConfig(config) {
      try {
        const response = await axios.post('/api/config', config);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update config');
      }
    },

    async start() {
      try {
        const response = await axios.post('/api/start');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to start automation');
      }
    },

    async pause() {
      try {
        const response = await axios.post('/api/pause');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to pause automation');
      }
    },

    async resume() {
      try {
        const response = await axios.post('/api/resume');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to resume automation');
      }
    },

    async stop() {
      try {
        const response = await axios.post('/api/stop');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to stop automation');
      }
    },

    async reset() {
      try {
        const response = await axios.post('/api/reset');
        dispatch({ type: 'CLEAR_LOGS' });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to reset service');
      }
    },

    async clearLogs() {
      try {
        const response = await axios.delete('/api/logs');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to clear logs');
      }
    },

    async exportLogs(format = 'json') {
      try {
        const response = await axios.get(`/api/logs/export?format=${format}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `puppeteer-logs-${new Date().toISOString().split('T')[0]}.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        throw new Error('Failed to export logs');
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, api }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
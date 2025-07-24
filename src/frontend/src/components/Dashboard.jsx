import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  CheckCircle,
  Error,
  Timer
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const { state } = useApp();
  const { status } = state;

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusIcon = () => {
    if (status.isRunning) {
      return status.isPaused ? <Pause color="warning" /> : <PlayArrow color="success" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (!status.isRunning) return 'Stopped';
    if (status.isPaused) return 'Paused';
    return 'Running';
  };

  const getStatusColor = () => {
    if (!status.isRunning) return 'default';
    if (status.isPaused) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          📊 Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Status */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ mb: 1 }}>
                {getStatusIcon()}
              </Box>
              <Chip 
                label={getStatusText()} 
                color={getStatusColor()}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Progress */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h4" align="center" gutterBottom>
                {status.currentVisit} / {status.totalVisits}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={status.progress || 0} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(status.progress || 0)}% Complete
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ETA: {formatTime(status.estimatedTimeRemaining)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Success: {status.stats.successful}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Errors: {status.stats.errors}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timer color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Avg: {status.stats.successful > 0 
                    ? Math.round(status.stats.totalTime / status.stats.successful / 1000) + 's'
                    : '--'
                  }
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Current URL */}
        {status.isRunning && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Currently visiting: <strong>{state.config.url}</strong>
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default Dashboard;
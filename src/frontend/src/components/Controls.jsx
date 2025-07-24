import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

function Controls() {
  const { state, api } = useApp();
  const { status } = state;
  const [loading, setLoading] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAction = async (action, actionName) => {
    setLoading({ ...loading, [actionName]: true });
    try {
      await action();
      showMessage(`${actionName} successful`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setLoading({ ...loading, [actionName]: false });
    }
  };

  const canStart = !status.isRunning;
  const canPause = status.isRunning && !status.isPaused;
  const canResume = status.isRunning && status.isPaused;
  const canStop = status.isRunning;
  const canReset = !status.isRunning;

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🎮 Controls
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                startIcon={<PlayArrow />}
                disabled={!canStart || loading.start}
                onClick={() => handleAction(api.start, 'start')}
                sx={{ height: 56 }}
              >
                {loading.start ? 'Starting...' : 'Start'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                startIcon={<Pause />}
                disabled={!canPause || loading.pause}
                onClick={() => handleAction(api.pause, 'pause')}
                sx={{ height: 56 }}
              >
                {loading.pause ? 'Pausing...' : 'Pause'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                startIcon={<PlayArrow />}
                disabled={!canResume || loading.resume}
                onClick={() => handleAction(api.resume, 'resume')}
                sx={{ height: 56 }}
              >
                {loading.resume ? 'Resuming...' : 'Resume'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                startIcon={<Stop />}
                disabled={!canStop || loading.stop}
                onClick={() => handleAction(api.stop, 'stop')}
                sx={{ height: 56 }}
              >
                {loading.stop ? 'Stopping...' : 'Stop'}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<Refresh />}
                disabled={!canReset || loading.reset}
                onClick={() => handleAction(api.reset, 'reset')}
              >
                {loading.reset ? 'Resetting...' : 'Reset All'}
              </Button>
            </Grid>
          </Grid>

          {/* Status Messages */}
          <Box sx={{ mt: 2 }}>
            {!status.isRunning && status.currentVisit > 0 && (
              <Alert severity="info">
                Last session completed {status.currentVisit} visits with {status.stats.successful} successful and {status.stats.errors} errors.
              </Alert>
            )}
            
            {status.isRunning && status.isPaused && (
              <Alert severity="warning">
                Automation is paused. Click Resume to continue or Stop to terminate.
              </Alert>
            )}
            
            {status.isRunning && !status.isPaused && (
              <Alert severity="success">
                Automation is running. Visit {status.currentVisit} of {status.totalVisits} in progress.
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Controls;
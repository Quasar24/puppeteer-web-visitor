import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Box,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ExpandMore,
  Save,
  Settings
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

function ConfigPanel() {
  const { state, api } = useApp();
  const [config, setConfig] = useState(state.config);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    setConfig(state.config);
  }, [state.config]);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateConfig(config);
      setSnackbar({ open: true, message: 'Configuration saved successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = state.status.isRunning;

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            Configuration Panel
          </Typography>

          {isDisabled && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Configuration is locked while automation is running. Stop the automation to make changes.
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading || isDisabled}
              size="large"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>

          {/* Basic Settings */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">🎯 Basic Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target URL"
                    value={config.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    disabled={isDisabled}
                    helperText="The website URL to visit"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Number of Visits: {config.visits}</Typography>
                  <Slider
                    value={config.visits}
                    onChange={(e, value) => handleChange('visits', value)}
                    min={1}
                    max={100}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 75, label: '75' },
                      { value: 100, label: '100' }
                    ]}
                    disabled={isDisabled}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.headless}
                        onChange={(e) => handleChange('headless', e.target.checked)}
                        disabled={isDisabled}
                      />
                    }
                    label="Headless Mode"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Run browser windows invisibly (faster but no visual feedback)
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Timing Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">⏱️ Timing Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Min Delay (ms)"
                    type="number"
                    value={config.minDelay}
                    onChange={(e) => handleChange('minDelay', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Minimum time to stay on page"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Delay (ms)"
                    type="number"
                    value={config.maxDelay}
                    onChange={(e) => handleChange('maxDelay', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Maximum time to stay on page"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Min Wait Between (ms)"
                    type="number"
                    value={config.minWaitBetween}
                    onChange={(e) => handleChange('minWaitBetween', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Minimum wait time between visits"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Wait Between (ms)"
                    type="number"
                    value={config.maxWaitBetween}
                    onChange={(e) => handleChange('maxWaitBetween', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Maximum wait time between visits"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Monitor Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">🖥️ Monitor Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Monitor 1 Width"
                    type="number"
                    value={config.monitor1Width}
                    onChange={(e) => handleChange('monitor1Width', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Primary monitor width in pixels"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Monitor 2 Position X"
                    type="number"
                    value={config.monitor2PositionX}
                    onChange={(e) => handleChange('monitor2PositionX', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="X position for browser windows"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Monitor 2 Position Y"
                    type="number"
                    value={config.monitor2PositionY}
                    onChange={(e) => handleChange('monitor2PositionY', parseInt(e.target.value) || 0)}
                    disabled={isDisabled}
                    helperText="Y position for browser windows"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Advanced Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">🔧 Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="User Agent"
                    value={config.userAgent}
                    onChange={(e) => handleChange('userAgent', e.target.value)}
                    disabled={isDisabled}
                    helperText="Browser user agent string"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
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

export default ConfigPanel;
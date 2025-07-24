import React from 'react';
import { Grid, Button, Box } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Controls from '../components/Controls';
import LogViewer from '../components/LogViewer';

function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header with Settings Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate('/settings')}
        >
          Configuration
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Dashboard */}
        <Grid item xs={12}>
          <Dashboard />
        </Grid>

        {/* Controls */}
        <Grid item xs={12}>
          <Controls />
        </Grid>

        {/* Log Viewer */}
        <Grid item xs={12}>
          <LogViewer />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;